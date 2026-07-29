/**
 * Lagre pulsen et sted som overlever prosessen den overvåker.
 *
 * Kravet er at lageret er *utenfor* containeren som skal drepes. En puls lagret
 * i samme prosess er verdiløs — dør prosessen, forsvinner beviset på at den
 * noen gang levde, og vaktbikkja har ingenting å reagere på.
 *
 * To implementasjoner:
 *   FilPuls   — delt volum. Ingen avhengigheter, riktig for én maskin.
 *   RedisPuls — egen container. Riktig når vaktbikkja kjører på en annen vert.
 */

import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { dirname, join } from "node:path";
import net from "node:net";
import type { PulsLager } from "./hjerteslag.ts";

interface Innpakning {
  readonly verdi: string;
  readonly utloper: number;
}

/**
 * Filbasert puls. Skriv-og-flytt for atomisitet: en vaktbikkje som leser
 * samtidig som løkken skriver skal aldri se en halvskrevet fil og tolke det som
 * død.
 */
export class FilPuls implements PulsLager {
  constructor(
    private readonly katalog: string,
    private readonly na: () => number = () => Date.now(),
  ) {}

  private sti(nokkel: string): string {
    return join(this.katalog, `${nokkel.replace(/[^a-zA-Z0-9._-]/g, "_")}.json`);
  }

  async skriv(nokkel: string, verdi: string, ttlMs: number): Promise<void> {
    const sti = this.sti(nokkel);
    await mkdir(dirname(sti), { recursive: true });
    const innpakning: Innpakning = { verdi, utloper: this.na() + ttlMs };
    const midlertidig = `${sti}.${process.pid}.tmp`;
    await writeFile(midlertidig, JSON.stringify(innpakning), "utf8");
    await rename(midlertidig, sti);
  }

  async les(nokkel: string): Promise<string | null> {
    let rå: string;
    try {
      rå = await readFile(this.sti(nokkel), "utf8");
    } catch {
      return null;
    }
    let innpakning: Innpakning;
    try {
      innpakning = JSON.parse(rå) as Innpakning;
    } catch {
      return null; // korrupt fil behandles som ingen puls
    }
    if (this.na() >= innpakning.utloper) return null;
    return innpakning.verdi;
  }
}

/**
 * Minimal Redis-klient for `SET key value PX ttl` og `GET key`.
 *
 * Skrevet ut i stedet for å ta inn et bibliotek fordi vaktbikkja skal ha så få
 * bevegelige deler som mulig: komponenten som avgjør om systemet er i live bør
 * ikke selv kunne feile på en avhengighetsoppgradering.
 */
export class RedisPuls implements PulsLager {
  private sokkel: net.Socket | null = null;
  private buffer = Buffer.alloc(0);
  private ventende: { løs: (v: string | null) => void; avvis: (f: Error) => void }[] = [];

  constructor(
    private readonly vert = "127.0.0.1",
    private readonly port = 6379,
    private readonly tilkoblingsfristMs = 2_000,
  ) {}

  private async koble(): Promise<net.Socket> {
    if (this.sokkel && !this.sokkel.destroyed) return this.sokkel;
    return new Promise((løs, avvis) => {
      const s = net.createConnection({ host: this.vert, port: this.port });
      s.setTimeout(this.tilkoblingsfristMs);
      s.once("connect", () => {
        s.setTimeout(0);
        s.on("data", (biter: Buffer) => this.taImot(biter));
        s.on("error", () => this.feilAlle(new Error("redis: tilkoblingsfeil")));
        s.on("close", () => this.feilAlle(new Error("redis: tilkobling lukket")));
        this.sokkel = s;
        løs(s);
      });
      s.once("timeout", () => {
        s.destroy();
        avvis(new Error(`redis: tidsavbrudd mot ${this.vert}:${this.port}`));
      });
      s.once("error", (f) => avvis(f));
    });
  }

  private feilAlle(feil: Error): void {
    const ventende = this.ventende;
    this.ventende = [];
    this.sokkel = null;
    for (const v of ventende) v.avvis(feil);
  }

  private taImot(biter: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, biter]);
    for (;;) {
      const slutt = this.buffer.indexOf("\r\n");
      if (slutt === -1) return;
      const type = String.fromCharCode(this.buffer[0]!);
      const hode = this.buffer.subarray(1, slutt).toString("utf8");

      if (type === "+" || type === ":") {
        this.buffer = this.buffer.subarray(slutt + 2);
        this.ventende.shift()?.løs(hode);
        continue;
      }
      if (type === "-") {
        this.buffer = this.buffer.subarray(slutt + 2);
        this.ventende.shift()?.avvis(new Error(`redis: ${hode}`));
        continue;
      }
      if (type === "$") {
        const lengde = Number(hode);
        if (lengde === -1) {
          this.buffer = this.buffer.subarray(slutt + 2);
          this.ventende.shift()?.løs(null);
          continue;
        }
        const start = slutt + 2;
        if (this.buffer.length < start + lengde + 2) return; // ikke komplett ennå
        const kropp = this.buffer.subarray(start, start + lengde).toString("utf8");
        this.buffer = this.buffer.subarray(start + lengde + 2);
        this.ventende.shift()?.løs(kropp);
        continue;
      }
      // Ukjent svartype: kast bufferen og feil de ventende framfor å tolke feil.
      this.buffer = Buffer.alloc(0);
      this.feilAlle(new Error(`redis: uventet svartype «${type}»`));
      return;
    }
  }

  private async kommando(...deler: string[]): Promise<string | null> {
    const sokkel = await this.koble();
    const kodet =
      `*${deler.length}\r\n` +
      deler.map((d) => `$${Buffer.byteLength(d)}\r\n${d}\r\n`).join("");
    return new Promise((løs, avvis) => {
      this.ventende.push({ løs, avvis });
      sokkel.write(kodet, (feil) => {
        if (feil) {
          this.ventende.pop();
          avvis(feil);
        }
      });
    });
  }

  async skriv(nokkel: string, verdi: string, ttlMs: number): Promise<void> {
    await this.kommando("SET", nokkel, verdi, "PX", String(Math.max(1, Math.floor(ttlMs))));
  }

  async les(nokkel: string): Promise<string | null> {
    return this.kommando("GET", nokkel);
  }

  async lukk(): Promise<void> {
    this.sokkel?.end();
    this.sokkel = null;
  }
}
