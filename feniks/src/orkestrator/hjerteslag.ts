/**
 * Dead man's switch — hjerteslaget.
 *
 * Rettelse av premisset, og dette er den viktigste av de tre:
 *
 * Et hjerteslag som sendes fra en `setInterval` oppdager ikke en frossen løkke.
 * Feilmodusen du beskriver — «API-er henger seg opp og loopen fryser» — er
 * nesten alltid en `await` som aldri løses. Da er event-loopen fullstendig
 * frisk. Timeren fyrer, pingen går, watchdogen ser en levende prosess, og
 * systemet står stille i timevis mens vaktbikkja rapporterer alt i orden.
 *
 * Et hjerteslag må derfor være *fremgangsdrevet*, ikke tidsdrevet. Løkken
 * kvitterer for hvert steg den faktisk fullfører, og emitteren sender bare puls
 * hvis fremgang er observert innenfor vinduet. Står løkken, stanser pulsen, og
 * vaktbikkja gjør jobben sin.
 *
 * Andre halvdel av forsvaret er `vakt()`: enhver `await` mot omverdenen får en
 * frist. En hengende `await` skal bli en feil vi kan håndtere, ikke en stillstand
 * vi må drepes ut av. Vaktbikkja er siste utvei, ikke førstelinje.
 *
 * Tomgang er fremgang: en løkke som skanner og finner null muligheter skal
 * kvittere for det (`registrerFremgang("tomgang")`). Ellers dreper vi et friskt
 * system i en rolig time.
 */

import type { Klokke } from "../kjerne/typer.ts";

/** Lager for pulsen. Må være utenfor prosessen som skal overvåkes. */
export interface PulsLager {
  /** Skriv pulsen med en levetid. Utløper den, er systemet dødt. */
  skriv(nokkel: string, verdi: string, ttlMs: number): Promise<void>;
  les(nokkel: string): Promise<string | null>;
  lukk?(): Promise<void>;
}

export interface HjerteslagValg {
  readonly nokkel: string;
  /** Hvor ofte vi forsøker å sende puls. */
  readonly intervallMs: number;
  /**
   * Hvor lenge løkken kan være uten fremgang før vi *slutter* å sende puls.
   * Skal være romsligere enn den lengste legitime tomgangsperioden, men
   * strammere enn hva du er villig til å stå stille.
   */
  readonly stillstandsgrenseMs: number;
  /**
   * Pulsens levetid i lageret. Må være lengre enn `intervallMs`, ellers utløper
   * pulsen mellom to normale slag og vi dreper oss selv.
   */
  readonly pulsTtlMs: number;
}

export const STANDARD_HJERTESLAG: HjerteslagValg = Object.freeze({
  nokkel: "feniks:puls",
  intervallMs: 5 * 60_000, // 5 minutter, som spesifisert
  stillstandsgrenseMs: 10 * 60_000,
  pulsTtlMs: 12 * 60_000,
});

export class Frist extends Error {
  constructor(
    readonly steg: string,
    readonly fristMs: number,
  ) {
    super(`steget «${steg}» overskred fristen på ${fristMs} ms`);
    this.name = "Frist";
  }
}

export interface Pulsbilde {
  readonly sekvens: number;
  readonly sisteSteg: string;
  readonly sisteFremgangVed: number;
  readonly stillstandMs: number;
  readonly friskt: boolean;
}

export class Hjerteslag {
  private sisteFremgangVed: number;
  private sisteSteg = "oppstart";
  private sekvens = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly lager: PulsLager,
    private readonly valg: HjerteslagValg = STANDARD_HJERTESLAG,
    private readonly klokke: Klokke = { na: () => Date.now() },
    private readonly paaFeil: (feil: unknown) => void = () => {},
  ) {
    if (valg.pulsTtlMs <= valg.intervallMs) {
      throw new Error(
        `pulsTtlMs (${valg.pulsTtlMs}) må være større enn intervallMs (${valg.intervallMs}), ` +
          `ellers utløper pulsen mellom to normale slag`,
      );
    }
    if (valg.stillstandsgrenseMs < valg.intervallMs) {
      throw new Error("stillstandsgrenseMs kan ikke være kortere enn intervallMs");
    }
    this.sisteFremgangVed = this.klokke.na();
  }

  /** Kvitter for et fullført steg. Kalles fra løkken, aldri fra en timer. */
  registrerFremgang(steg: string): void {
    this.sisteFremgangVed = this.klokke.na();
    this.sisteSteg = steg;
    this.sekvens += 1;
  }

  /** Nåværende tilstand, uten å skrive noe. */
  bilde(): Pulsbilde {
    const stillstand = this.klokke.na() - this.sisteFremgangVed;
    return {
      sekvens: this.sekvens,
      sisteSteg: this.sisteSteg,
      sisteFremgangVed: this.sisteFremgangVed,
      stillstandMs: stillstand,
      friskt: stillstand <= this.valg.stillstandsgrenseMs,
    };
  }

  /**
   * Send én puls hvis og bare hvis løkken har gjort fremgang.
   * Returnerer true når puls ble sendt.
   */
  async slaa(): Promise<boolean> {
    const bilde = this.bilde();
    if (!bilde.friskt) return false;
    await this.lager.skriv(
      this.valg.nokkel,
      JSON.stringify({ ...bilde, sendtVed: this.klokke.na() }),
      this.valg.pulsTtlMs,
    );
    return true;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.slaa().catch(this.paaFeil);
    }, this.valg.intervallMs);
    // Hjerteslaget skal ikke holde prosessen kunstig i live.
    this.timer.unref?.();
  }

  stopp(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * Kjør et steg med frist, og kvitter for fremgang når det lykkes.
   *
   * Dette er mekanismen som gjør at et hengende API blir en håndterbar feil i
   * stedet for en stillstand. `arbeid` får et `AbortSignal` slik at kall som
   * støtter avbrudd faktisk kan avbrytes — uten det fortsetter den underliggende
   * forespørselen å leve videre etter at fristen er utløpt, og vi lekker
   * tilkoblinger i stedet for å frigjøre dem.
   */
  async vakt<T>(
    steg: string,
    fristMs: number,
    arbeid: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const styrer = new AbortController();
    const timer = setTimeout(() => styrer.abort(new Frist(steg, fristMs)), fristMs);
    try {
      const resultat = await Promise.race([
        arbeid(styrer.signal),
        new Promise<never>((_, avvis) => {
          styrer.signal.addEventListener(
            "abort",
            () => avvis(styrer.signal.reason ?? new Frist(steg, fristMs)),
            { once: true },
          );
        }),
      ]);
      this.registrerFremgang(steg);
      return resultat;
    } finally {
      clearTimeout(timer);
    }
  }
}
