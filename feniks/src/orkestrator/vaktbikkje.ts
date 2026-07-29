/**
 * Vaktbikkja — uavhengig prosess som dreper og starter Orkestratoren på nytt.
 *
 * Må kjøre i sin *egen* container. En vaktbikkje i samme container som det den
 * overvåker deler skjebne med det, og da overvåker den ingenting.
 *
 * «Maskinen sover aldri» med ett nødvendig forbehold: ubegrenset omstart er
 * verre enn nedetid. En container som krasjer ved oppstart og startes på nytt
 * hvert minutt gjør tusenvis av kall mot eBay og X i løpet av en natt, alle
 * feilende, alle fra samme legitimasjon. Det er den raskeste veien til den
 * varige sperren hele denne arkitekturen forsøker å unngå — og det ville skjedd
 * mens ingen ser på.
 *
 * Derfor: omstart er rasjonert. Etter `maksOmstarterPerVindu` går vaktbikkja i
 * karantene og slutter å starte på nytt. Karantene er en tilstand som krever et
 * menneske. Det er riktig utfall: et system som ikke kan starte, skal ikke
 * fortsette å prøve.
 */

import type { Klokke } from "../kjerne/typer.ts";

import { stilleLogg, type Logg } from "../kjerne/logg.ts";
import type { PulsLager } from "./hjerteslag.ts";

/** Den som faktisk utfører drapet. Skilt ut for å kunne testes uten Docker. */
export interface Drapsmann {
  drep(arsak: string): Promise<void>;
}

export type Vaktstatus = "frisk" | "drepte" | "karantene" | "venter";

export interface VaktValg {
  readonly nokkel: string;
  /**
   * Hvor lenge pulsen kan være borte før vi dreper. Skal være romsligere enn
   * hjerteslagets `pulsTtlMs`, ellers dreper vi under en normal
   * nettverkshikke.
   */
  readonly naadetidMs: number;
  readonly maksOmstarterPerVindu: number;
  readonly vinduMs: number;
}

export const STANDARD_VAKT: VaktValg = Object.freeze({
  nokkel: "feniks:puls",
  naadetidMs: 15 * 60_000,
  maksOmstarterPerVindu: 3,
  vinduMs: 60 * 60_000,
});

export interface Vaktrapport {
  readonly status: Vaktstatus;
  readonly forklaring: string;
  readonly omstarterIVindu: number;
}

export class Vaktbikkje {
  private readonly omstarter: number[] = [];
  private iKarantene = false;
  private sisteDrap = 0;

  constructor(
    private readonly lager: PulsLager,
    private readonly drapsmann: Drapsmann,
    private readonly valg: VaktValg = STANDARD_VAKT,
    private readonly logg: Logg = stilleLogg,
    private readonly klokke: Klokke = { na: () => Date.now() },
  ) {}

  private beskjaer(): void {
    const grense = this.klokke.na() - this.valg.vinduMs;
    while (this.omstarter.length > 0 && this.omstarter[0]! < grense) {
      this.omstarter.shift();
    }
  }

  /** Én runde. Kalles fra en enkel løkke eller et cron-intervall. */
  async sjekk(): Promise<Vaktrapport> {
    this.beskjaer();

    if (this.iKarantene) {
      return {
        status: "karantene",
        forklaring:
          `karantene etter ${this.omstarter.length} omstarter innenfor ` +
          `${this.valg.vinduMs} ms. Krever manuell inngripen — systemet klarer ` +
          `ikke å komme opp av seg selv, og videre omstarter gjør bare skade.`,
        omstarterIVindu: this.omstarter.length,
      };
    }

    const puls = await this.lager.les(this.valg.nokkel);

    if (puls !== null) {
      const alder = this.pulsalder(puls);
      if (alder === null || alder <= this.valg.naadetidMs) {
        return { status: "frisk", forklaring: "puls til stede", omstarterIVindu: this.omstarter.length };
      }
      this.logg.varsel("puls er gammel", { alderMs: alder, naadetidMs: this.valg.naadetidMs });
    }

    // Ikke drep to ganger på rad før den nye instansen har fått sjanse til å
    // rekke sitt første hjerteslag.
    const siden = this.klokke.na() - this.sisteDrap;
    if (this.sisteDrap > 0 && siden < this.valg.naadetidMs) {
      return {
        status: "venter",
        forklaring: `drepte for ${siden} ms siden, venter på første puls fra ny instans`,
        omstarterIVindu: this.omstarter.length,
      };
    }

    if (this.omstarter.length >= this.valg.maksOmstarterPerVindu) {
      this.iKarantene = true;
      this.logg.feil("karantene — slutter å starte på nytt", {
        omstarter: this.omstarter.length,
        vinduMs: this.valg.vinduMs,
      });
      return {
        status: "karantene",
        forklaring: "omstartsbudsjettet er brukt opp",
        omstarterIVindu: this.omstarter.length,
      };
    }

    const arsak =
      puls === null
        ? "pulsen er utløpt — løkken har ikke gjort fremgang"
        : "pulsen er eldre enn nådetiden";

    this.logg.varsel("dreper og starter på nytt", { arsak });
    await this.drapsmann.drep(arsak);
    const na = this.klokke.na();
    this.omstarter.push(na);
    this.sisteDrap = na;

    return { status: "drepte", forklaring: arsak, omstarterIVindu: this.omstarter.length };
  }

  /** Alder på pulsen ut fra `sendtVed`, eller null om feltet mangler. */
  private pulsalder(puls: string): number | null {
    try {
      const tolket = JSON.parse(puls) as { sendtVed?: number };
      if (typeof tolket.sendtVed !== "number") return null;
      return this.klokke.na() - tolket.sendtVed;
    } catch {
      return null;
    }
  }

  /** Løft karantenen. Skal kalles av et menneske, ikke av systemet. */
  frigi(): void {
    this.iKarantene = false;
    this.omstarter.length = 0;
    this.sisteDrap = 0;
    this.logg.info("karantene løftet manuelt");
  }
}

/**
 * Drapsmann som starter en Docker-container på nytt.
 *
 * `torrkjoring` har ingen standardverdi med vilje. En komponent hvis eneste jobb
 * er å drepe produksjonsprosesser skal ikke kunne konfigureres ved uhell — verken
 * til å drepe når du trodde den var trygg, eller til å være stille når du trodde
 * den var bevæpnet.
 */
export class DockerDrapsmann implements Drapsmann {
  constructor(
    private readonly container: string,
    private readonly torrkjoring: boolean,
    private readonly logg: Logg = stilleLogg,
    private readonly kjor: (kommando: string, argumenter: string[]) => Promise<void> = standardKjor,
  ) {
    if (!container) throw new Error("containernavn mangler");
  }

  async drep(arsak: string): Promise<void> {
    if (this.torrkjoring) {
      this.logg.varsel("tørrkjøring: ville startet container på nytt", {
        container: this.container,
        arsak,
      });
      return;
    }
    this.logg.feil("starter container på nytt", { container: this.container, arsak });
    // `restart` framfor `kill`: vi vil ha en kald start, ikke en død container.
    await this.kjor("docker", ["restart", "--time", "10", this.container]);
  }
}

async function standardKjor(kommando: string, argumenter: string[]): Promise<void> {
  const { spawn } = await import("node:child_process");
  await new Promise<void>((løs, avvis) => {
    const barn = spawn(kommando, argumenter, { stdio: "inherit" });
    barn.once("error", avvis);
    barn.once("exit", (kode) =>
      kode === 0 ? løs() : avvis(new Error(`${kommando} avsluttet med kode ${kode}`)),
    );
  });
}
