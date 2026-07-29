/**
 * Agent 12 — Livvakten.
 *
 * Ligger foran Eksekutøren (agent 7). Ingen handel går på kjeden uten å ha
 * passert her. Porten er lukket som standard: mangler et tall, dør operasjonen.
 *
 * Fire krav må holde samtidig:
 *
 *   1. Reservene er ferske. Gamle reserver gir feil `minUt`, og feil `minUt`
 *      gjør hele MEV-grensen ugyldig.
 *   2. Kjeden har en beskyttelsesform. Ingen beskyttelse, ingen handel.
 *   3. Slippasjevinduet er mindre enn hva et angrep koster angriperen — eller
 *      handelen rutes gjennom en privat bygger *og* vinduet er lite nok til at
 *      et byggersvik ikke velter operasjonens fortjeneste.
 *   4. Forhåndssimuleringen lykkes og gir minst `minUt`.
 */

import { BPS } from "../kjerne/penger.ts";
import type { Grunnenhet, UsdCent } from "../kjerne/penger.ts";
import { drept, godkjent, systemklokke } from "../kjerne/typer.ts";
import type { Basseng, Dom, Klokke } from "../kjerne/typer.ts";
import { stilleLogg, type Logg } from "../kjerne/logg.ts";
import { beregnSlippasje, type Slippasje } from "./slippasje.ts";
import {
  STANDARD_ANGRIPER,
  planleggTrygtVindu,
  verdiUsd,
  type AngriperModell,
  type MevVurdering,
  type Pris,
} from "./mev.ts";
import {
  beskyttelseFor,
  velgEndepunkt,
  type Beskyttelsesform,
  type PrivatEndepunkt,
  type RaTransaksjon,
  type Simulator,
} from "./ruting.ts";

export interface LivvaktValg {
  /** Hvor gamle bassengreserver vi godtar. Over dette: les på nytt. */
  readonly maksReserveAlderMs: number;
  /** Ønsket slippasjetoleranse før MEV-grensen eventuelt strammer den inn. */
  readonly onsketToleranseBps: bigint;
  /**
   * Slippasjevinduet får aldri utgjøre mer enn denne andelen av operasjonens
   * bruttofortjeneste. Sikrer at selv verste tillatte fyll etterlater
   * operasjonen lønnsom — også hvis en privat bygger skulle svikte.
   */
  readonly maksVinduAvBruttoBps: bigint;
  /** Krymp handelen når vinduet er for stort, i stedet for å drepe den. */
  readonly tillatKrymping: boolean;
  readonly angriper: AngriperModell;
}

export const STANDARD_LIVVAKT: LivvaktValg = Object.freeze({
  maksReserveAlderMs: 4_000,
  onsketToleranseBps: 50n, // 0,5 %
  maksVinduAvBruttoBps: 2_500n, // vinduet < 25 % av brutto
  tillatKrymping: true,
  angriper: STANDARD_ANGRIPER,
});

export interface Handelsforslag {
  readonly operasjonId: string;
  readonly inn: Grunnenhet;
  readonly basseng: Basseng;
  readonly utPris: Pris;
  /** Operasjonens bruttofortjeneste slik Analytikeren anslo den. */
  readonly bruttoUsd: UsdCent;
  /** Byggeklossen Eksekutøren skal sende, uten `minUt` satt. */
  readonly tx: Omit<RaTransaksjon, "kjede">;
}

export interface Rutingdom {
  readonly dom: Dom;
  readonly beskyttelse: Beskyttelsesform;
  readonly endepunkt: PrivatEndepunkt | null;
  /** Endelig innbeløp. Kan være krympet ned fra forslaget. */
  readonly inn: Grunnenhet;
  readonly slippasje: Slippasje | null;
  readonly mev: MevVurdering | null;
}

export class Livvakt {
  constructor(
    private readonly simulator: Simulator,
    private readonly valg: LivvaktValg = STANDARD_LIVVAKT,
    private readonly logg: Logg = stilleLogg,
    private readonly klokke: Klokke = systemklokke,
  ) {}

  async vurder(forslag: Handelsforslag): Promise<Rutingdom> {
    const logg = this.logg.med({ operasjon: forslag.operasjonId });
    const kjede = forslag.basseng.inn.kjede;
    const beskyttelse = beskyttelseFor(kjede);
    const tomt: Omit<Rutingdom, "dom"> = {
      beskyttelse,
      endepunkt: null,
      inn: forslag.inn,
      slippasje: null,
      mev: null,
    };

    // 1. Ingen beskyttelsesform betyr ingen handel, uansett hvor god marginen er.
    if (beskyttelse === "ingen") {
      const dom = drept(
        "ingen-mev-beskyttelse",
        `${kjede} har offentlig mempool og ingen beskyttet innsendingsvei`,
      );
      logg.varsel("handel drept", { arsak: dom.arsak });
      return { ...tomt, dom };
    }

    // 2. Ferske reserver. Gamle reserver gjør alle tallene under meningsløse.
    const alder = this.klokke.na() - forslag.basseng.lestVed;
    if (alder > this.valg.maksReserveAlderMs) {
      const dom = drept(
        "foreldede-reserver",
        `reservene er ${alder} ms gamle, grensen er ${this.valg.maksReserveAlderMs} ms`,
      );
      logg.varsel("handel drept", { arsak: dom.arsak, alderMs: alder });
      return { ...tomt, dom };
    }

    // 3. Slippasje og MEV-grense. Stram toleransen først, krymp bare om nødvendig.
    const plan = planleggTrygtVindu(
      forslag.inn,
      forslag.basseng,
      this.valg.onsketToleranseBps,
      forslag.utPris,
      beregnSlippasje,
      this.valg.angriper,
      this.valg.tillatKrymping,
    );
    const { inn, slippasje, mev } = plan;

    if (!plan.tiltak.includes("uendret")) {
      logg.info("vinduet krevde tiltak", {
        tiltak: plan.tiltak,
        innFra: forslag.inn,
        innTil: inn,
        toleranseFra: this.valg.onsketToleranseBps,
        toleranseTil: plan.toleranseBps,
      });
    }

    // Vinduet må aldri kunne spise operasjonens fortjeneste. Gjelder også bak
    // en privat bygger: privat ruting er tillit, ikke bevis.
    const vinduTak = (forslag.bruttoUsd * this.valg.maksVinduAvBruttoBps) / BPS;
    if (forslag.bruttoUsd > 0n && mev.vinduUsd > vinduTak) {
      const dom = drept(
        "vindu-for-stort-mot-brutto",
        `slippasjevindu ${mev.vinduUsd} cent overstiger taket ${vinduTak} cent ` +
          `(${this.valg.maksVinduAvBruttoBps} bp av brutto ${forslag.bruttoUsd} cent)`,
      );
      logg.varsel("handel drept", { arsak: dom.arsak, vinduUsd: mev.vinduUsd, vinduTak });
      return { ...tomt, inn, slippasje, mev, dom };
    }

    // Uten privat vei må vinduet i seg selv være ulønnsomt å angripe.
    if (!mev.trygtOffentlig && beskyttelse !== "privat-bygger") {
      const dom = drept(
        "mev-vindu-lonnsomt-a-angripe",
        `vindu ${mev.vinduUsd} cent er over angriperens terskel ` +
          `${mev.angriperTerskelUsd} cent, og ${kjede} har ingen privat vei. ` +
          `Høyeste trygge toleranse er ${mev.maksTryggToleranseBps} bp.`,
      );
      logg.varsel("handel drept", { arsak: dom.arsak, vinduUsd: mev.vinduUsd });
      return { ...tomt, inn, slippasje, mev, dom };
    }

    const endepunkt = velgEndepunkt(kjede);
    if (beskyttelse === "privat-bygger" && endepunkt === null) {
      const dom = drept(
        "ingen-privat-rute-tilgjengelig",
        "alle private endepunkter er utilgjengelige; nekter å falle tilbake til offentlig mempool",
      );
      logg.feil("handel drept", { arsak: dom.arsak });
      return { ...tomt, inn, slippasje, mev, dom };
    }

    // 4. Forhåndssimulering. Simulert utbeløp må dekke minUt.
    const tx: RaTransaksjon = { ...forslag.tx, kjede };
    const utfall = await this.simulator.simuler(tx);
    if (!utfall.ok) {
      const dom = drept("simulering-reverterte", `simulering feilet: ${utfall.revertArsak}`);
      logg.varsel("handel drept", { arsak: dom.arsak, revert: utfall.revertArsak });
      return { ...tomt, inn, slippasje, mev, endepunkt, dom };
    }
    if (utfall.utBelop < slippasje.minUt) {
      const dom = drept(
        "simulert-under-minut",
        `simulering gav ${utfall.utBelop}, under minUt ${slippasje.minUt}`,
      );
      logg.varsel("handel drept", { arsak: dom.arsak });
      return { ...tomt, inn, slippasje, mev, endepunkt, dom };
    }

    const dom = godkjent(
      "godkjent",
      `vindu ${mev.vinduUsd} cent under terskel ${mev.angriperTerskelUsd} cent, ` +
        `rute ${endepunkt?.navn ?? beskyttelse}`,
    );
    logg.info("handel godkjent", {
      inn,
      minUt: slippasje.minUt,
      forventetUt: slippasje.forventetUt,
      vinduUsd: mev.vinduUsd,
      prisimpaktBps: slippasje.prisimpaktBps,
      rute: endepunkt?.navn ?? beskyttelse,
      verdiSimulert: verdiUsd(utfall.utBelop, forslag.utPris),
    });
    return { dom, beskyttelse, endepunkt, inn, slippasje, mev };
  }
}

export * from "./slippasje.ts";
export * from "./mev.ts";
export * from "./ruting.ts";
