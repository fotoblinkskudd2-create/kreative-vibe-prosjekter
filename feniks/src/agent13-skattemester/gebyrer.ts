/**
 * Plattform-, frakt- og brogebyrer.
 *
 * Dette er lekkasjene som ikke vises i noen ROI-beregning fordi de påløper på
 * ulike tidspunkt og i ulike systemer: børsen tar sitt ved fyll, uttaket tar
 * sitt ved flytting, fraktleddet tar sitt ved levering, broen tar sitt i
 * mellomtiden. Hver for seg små. Samlet er de det som spiser en mikromargin.
 *
 * Alle satser i basispunkter, alle faste ledd i cent.
 */

import { BPS, andelBps, sum } from "../kjerne/penger.ts";
import type { UsdCent } from "../kjerne/penger.ts";

export interface GebyrSats {
  /** Andel av omsatt volum, i basispunkter. */
  readonly bps: bigint;
  /** Fast ledd i cent, uavhengig av volum. */
  readonly fastCent: UsdCent;
  /** Nedre grense i cent. Mange plattformer har et minstegebyr. */
  readonly minimumCent: UsdCent;
}

export function sats(bps: bigint, fastCent: UsdCent = 0n, minimumCent: UsdCent = 0n): GebyrSats {
  return { bps, fastCent, minimumCent };
}

export function bereg(volumCent: UsdCent, s: GebyrSats): UsdCent {
  const rått = andelBps(volumCent, s.bps) + s.fastCent;
  return rått < s.minimumCent ? s.minimumCent : rått;
}

/**
 * Satser som utgangspunkt. Disse *skal* overstyres med de faktiske satsene for
 * din konto — nivåbaserte børsrabatter og selgerkategorier gjør at generiske
 * tall er feil i begge retninger. De står her for å gjøre modellen komplett,
 * ikke for å bli brukt uendret i produksjon.
 */
export const SATSER = Object.freeze({
  /** Uniswap V2-basseng: 30 bp. V3 varierer 1/5/30/100 bp per basseng. */
  dexBasseng: sats(30n),
  /** Typisk CEX taker-gebyr på laveste nivå. */
  cexTaker: sats(10n),
  cexMaker: sats(2n),
  /** Uttak fra CEX: fast per eiendel, ikke volumbasert. */
  cexUttak: sats(0n, 150n),
  /** Kanonisk bro: gebyrfri, men gass i begge ender. Rask bro tar en andel. */
  raskBro: sats(5n, 0n, 50n),
});

export interface Friksjonsledd {
  readonly navn: string;
  readonly cent: UsdCent;
  /** Er leddet allerede påløpt, eller er det et anslag? */
  readonly sikkerhet: "kjent" | "anslag";
}

export function ledd(
  navn: string,
  cent: UsdCent,
  sikkerhet: Friksjonsledd["sikkerhet"] = "anslag",
): Friksjonsledd {
  return { navn, cent, sikkerhet };
}

export interface Friksjonsregnskap {
  readonly ledd: readonly Friksjonsledd[];
  readonly totaltCent: UsdCent;
  /** Andelen av totalen som er anslag, i basispunkter. */
  readonly anslagsandelBps: bigint;
}

export function summerFriksjon(alle: readonly Friksjonsledd[]): Friksjonsregnskap {
  const totalt = sum(alle.map((l) => l.cent));
  const anslag = sum(alle.filter((l) => l.sikkerhet === "anslag").map((l) => l.cent));
  return {
    ledd: alle,
    totaltCent: totalt,
    anslagsandelBps: totalt === 0n ? 0n : (anslag * BPS) / totalt,
  };
}
