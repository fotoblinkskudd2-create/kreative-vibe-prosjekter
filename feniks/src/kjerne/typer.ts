/**
 * Delte typer i Føniks-arkitekturen.
 *
 * Agent 1–10 er definert utenfor denne pakken. Her modelleres kun kontraktene
 * agent 11, 12 og 13 trenger for å kunne settes inn i kjeden:
 *
 *   Agent 3 (Researcher) --[Portneren/11]--> rådata
 *   Agent 6 (Analytiker)  ------------------> BruttoMulighet
 *   Agent 13 (Skattemester) ---------------> Friksjonsdom   (dreper eller slipper)
 *   Agent 12 (Livvakt)      ---------------> Rutingdom      (dreper eller slipper)
 *   Agent 7 (Eksekutør)     ---------------> utført handel
 */

import type { Grunnenhet, UsdCent } from "./penger.ts";

/** Kjeder vi kan handle på. Avgiftsmodellen skiller L1 fra L2. */
export type Kjede =
  | "ethereum"
  | "arbitrum"
  | "optimism"
  | "base"
  | "polygon";

export const ER_L2: Readonly<Record<Kjede, boolean>> = Object.freeze({
  ethereum: false,
  arbitrum: true,
  optimism: true,
  base: true,
  polygon: false,
});

/** En eiendel, med desimalene som gjør grunnenheten tolkbar. */
export interface Eiendel {
  readonly symbol: string;
  readonly adresse: string;
  readonly desimaler: number;
  readonly kjede: Kjede;
}

/** Reservene i et konstantprodukt-basseng (Uniswap V2-semantikk). */
export interface Basseng {
  readonly inn: Eiendel;
  readonly ut: Eiendel;
  /** Reserve av inn-eiendelen, i grunnenheter. */
  readonly reserveInn: Grunnenhet;
  /** Reserve av ut-eiendelen, i grunnenheter. */
  readonly reserveUt: Grunnenhet;
  /** Bassengets gebyr i basispunkter. Uniswap V2 = 30. */
  readonly gebyrBps: bigint;
  /** Når reservene ble lest. Gamle reserver er farlige reserver. */
  readonly lestVed: number;
}

/**
 * En mulighet slik Analytikeren (agent 6) leverer den: brutto, før friksjon.
 * Ingen av tallene her er å stole på som netto.
 */
export interface BruttoMulighet {
  readonly id: string;
  readonly kjede: Kjede;
  /** Forventet bruttofortjeneste før alle avgifter og all slippasje. */
  readonly bruttoUsd: UsdCent;
  /** Kapital som låses for å realisere muligheten. */
  readonly innsatsUsd: UsdCent;
  /** Hvor lenge muligheten antas å eksistere, i millisekunder. */
  readonly levetidMs: number;
  readonly kilde: string;
}

/** Utfall av en portvakt. Alle porter er «slipp gjennom» eller «drep». */
export type Domsutfall = "godkjent" | "drept";

export interface Dom {
  readonly utfall: Domsutfall;
  /** Maskinlesbar årsak, egnet for telling i metrikker. */
  readonly arsak: string;
  /** Menneskelesbar forklaring for logg og etterforskning. */
  readonly forklaring: string;
}

export function godkjent(arsak: string, forklaring: string): Dom {
  return { utfall: "godkjent", arsak, forklaring };
}

export function drept(arsak: string, forklaring: string): Dom {
  return { utfall: "drept", arsak, forklaring };
}

/** En klokke, injisert slik at tester ikke må vente på virkelig tid. */
export interface Klokke {
  na(): number;
}

export const systemklokke: Klokke = { na: () => Date.now() };
