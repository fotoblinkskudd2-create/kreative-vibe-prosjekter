/**
 * Orkestratorens kjede for én operasjon.
 *
 * Rekkefølgen er ikke tilfeldig:
 *
 *   Portneren (11)  — har vi i det hele tatt data? Kilde nede = ingen operasjon.
 *   Skattemester (13) — er det penger igjen etter avgifter? Billigst port først;
 *                       de fleste operasjoner dør her, og de skal dø før vi
 *                       bruker RPC-kall på dem.
 *   Livvakt (12)     — kan handelen utføres uten at noen tar marginen? Krever
 *                       ferske reserver og en simulering, så den kjøres sist.
 *   Eksekutør (7)    — signerer og sender.
 *
 * Hver port kan bare drepe. Ingen port kan overstyre en annens drap. Det er
 * derfor kjeden er trygg å utvide: en ny port kan legges inn hvor som helst uten
 * å svekke de andre.
 *
 * Hvert steg går gjennom `hjerteslag.vakt()` med egen frist. Det er det som
 * gjør at et hengende RPC-kall blir en avvist operasjon i stedet for en frossen
 * løkke.
 */

import { stilleLogg, type Logg } from "../kjerne/logg.ts";
import type { BruttoMulighet, Dom } from "../kjerne/typer.ts";
import { drept, godkjent } from "../kjerne/typer.ts";
import type { Friksjonsledd } from "../agent13-skattemester/gebyrer.ts";
import type { Friksjonsdom, Skattemester } from "../agent13-skattemester/index.ts";
import type { Handelsforslag, Livvakt, Rutingdom } from "../agent12-livvakten/index.ts";
import { Frist, type Hjerteslag } from "./hjerteslag.ts";
import type { Hvelv, Hvelvrotasjon, IsolasjonsValg } from "./lommebokisolasjon.ts";

export interface Frister {
  readonly friksjonMs: number;
  readonly rutingMs: number;
  readonly eksekveringMs: number;
}

export const STANDARD_FRISTER: Frister = Object.freeze({
  friksjonMs: 2_000,
  rutingMs: 8_000,
  eksekveringMs: 30_000,
});

/** Agent 7 sett fra Orkestratoren. */
export interface Eksekutor {
  utfor(
    forslag: Handelsforslag,
    ruting: Rutingdom,
    hvelv: Hvelv,
    signal: AbortSignal,
  ): Promise<{ readonly hash: string }>;
}

export interface Operasjonsutfall {
  readonly operasjonId: string;
  readonly dom: Dom;
  readonly friksjon: Friksjonsdom | null;
  readonly ruting: Rutingdom | null;
  readonly hvelv: string | null;
  readonly hash: string | null;
}

export interface PipelineDeler {
  readonly skattemester: Skattemester;
  readonly livvakt: Livvakt;
  readonly eksekutor: Eksekutor;
  readonly rotasjon: Hvelvrotasjon;
  readonly hjerteslag: Hjerteslag;
  readonly isolasjon: IsolasjonsValg;
  readonly frister?: Frister;
  readonly logg?: Logg;
}

export class Pipeline {
  private readonly frister: Frister;
  private readonly logg: Logg;

  constructor(private readonly deler: PipelineDeler) {
    this.frister = deler.frister ?? STANDARD_FRISTER;
    this.logg = deler.logg ?? stilleLogg;
  }

  async kjor(
    mulighet: BruttoMulighet,
    avgifter: readonly Friksjonsledd[],
    byggForslag: (inn: bigint) => Handelsforslag,
    innBelop: bigint,
  ): Promise<Operasjonsutfall> {
    const logg = this.logg.med({ operasjon: mulighet.id });
    const hs = this.deler.hjerteslag;

    const tomt = {
      operasjonId: mulighet.id,
      friksjon: null,
      ruting: null,
      hvelv: null,
      hash: null,
    };

    try {
      // Port 1 — avgifter. Rent regnestykke, ingen nettverk, dermed kort frist.
      const friksjon = await hs.vakt("friksjonsport", this.frister.friksjonMs, async () =>
        this.deler.skattemester.vurder(mulighet, avgifter),
      );
      if (friksjon.dom.utfall === "drept") {
        return { ...tomt, friksjon, dom: friksjon.dom };
      }

      // Hvelv velges før Livvakten. `neste()` håndhever eksponeringstaket selv,
      // så et hvelv herfra har per definisjon rom for innsatsen.
      const hvelv = this.deler.rotasjon.neste(mulighet.innsatsUsd);
      if (hvelv === null) {
        const d = this.deler.rotasjon.diagnose(mulighet.innsatsUsd);
        const dom = drept(
          "ingen-hvelv-tilgjengelig",
          `ingen branncelle har eksponeringsrom for ${mulighet.innsatsUsd} cent: ` +
            `${d.totalt} hvelv totalt, ${d.pensjonerte} pensjonert, ` +
            `${d.kompromitterte} kompromittert, ${d.forSmaa} for små. ` +
            (d.forSmaa > 0 && d.pensjonerte === 0
              ? "Kapitalen er fragmentert for tynt for denne operasjonsstørrelsen."
              : "Rotasjonen har brukt opp branncellene; hvelvene må etterfylles."),
        );
        logg.varsel("operasjon drept", { arsak: dom.arsak, ...d });
        return { ...tomt, friksjon, dom };
      }

      // Port 2 — MEV og ruting. Krever ferske reserver og en simulering.
      const forslag = byggForslag(innBelop);
      const ruting = await hs.vakt("rutingport", this.frister.rutingMs, async () =>
        this.deler.livvakt.vurder(forslag),
      );
      if (ruting.dom.utfall === "drept") {
        return { ...tomt, friksjon, ruting, hvelv: hvelv.id, dom: ruting.dom };
      }

      // Eksekvering.
      const { hash } = await hs.vakt("eksekvering", this.frister.eksekveringMs, (signal) =>
        this.deler.eksekutor.utfor(forslag, ruting, hvelv, signal),
      );

      // Rotér hvelvet uansett utfall av handelen: det har nå signert mot en
      // ekstern kontrakt, og det er hendelsen som avgjør rotasjonen.
      this.deler.rotasjon.bokfor(hvelv.id);

      const dom = godkjent("utfort", `handel sendt: ${hash}`);
      logg.info("operasjon utført", {
        hash,
        hvelv: hvelv.id,
        nettoCent: friksjon.nettoCent,
        rute: ruting.endepunkt?.navn ?? ruting.beskyttelse,
      });
      return { ...tomt, friksjon, ruting, hvelv: hvelv.id, hash, dom };
    } catch (feil) {
      if (feil instanceof Frist) {
        // En overskredet frist er en avvist operasjon, ikke en systemfeil.
        // Fremgang registreres ikke, så en løkke som bare treffer frister vil
        // etter hvert slutte å pulse og bli startet på nytt av vaktbikkja.
        const dom = drept("frist-overskredet", feil.message);
        logg.varsel("operasjon drept", { arsak: dom.arsak, steg: feil.steg });
        return { ...tomt, dom };
      }
      const dom = drept("uventet-feil", feil instanceof Error ? feil.message : String(feil));
      logg.feil("operasjon feilet", { feil });
      return { ...tomt, dom };
    }
  }
}

export * from "./hjerteslag.ts";
export * from "./lommebokisolasjon.ts";
export * from "./puls-lager.ts";
export * from "./vaktbikkje.ts";
