/**
 * Dynamiske nettverksavgifter.
 *
 * Rettelse av premisset: å budsjettere med *forventet* gasspris er nettopp
 * hullet som drenerer katalysatoren. Mellom øyeblikket Analytikeren regner ROI
 * og øyeblikket transaksjonen inkluderes, kan basefee ha steget. EIP-1559
 * tillater +12,5 % per blokk, og det er sammensatt: over fire blokker er taket
 * ~1,60x, over åtte ~2,57x.
 *
 * Skattemesteren budsjetterer derfor på *taket*, ikke på anslaget. En operasjon
 * som bare er lønnsom til dagens basefee er ikke lønnsom.
 *
 * 12,5 % er eksakt 9/8, så taket regnes i heltall uten avrundingsfeil:
 *
 *   tak(basefee, n) = basefee * 9^n / 8^n
 */

import { PengeFeil } from "../kjerne/penger.ts";
import type { UsdCent } from "../kjerne/penger.ts";
import { ER_L2, type Kjede } from "../kjerne/typer.ts";

/** Wei per gass-enhet. */
export type WeiPerGass = bigint;

export interface GassTilstand {
  readonly kjede: Kjede;
  /** Gjeldende basefee. */
  readonly baseFeeWei: WeiPerGass;
  /** Prioritetsgebyr vi faktisk akter å by. */
  readonly prioritetWei: WeiPerGass;
  /**
   * For OP-stack-L2: kostnaden for å publisere kalldata på L1, i wei, for
   * *denne* transaksjonen. Hentes fra gassprisorakelet
   * (0x420000000000000000000000000000000000000F, `getL1Fee`). Uten dette tallet
   * er en L2-kostnadsberegning ren gjetning — L1-delen dominerer ofte totalen.
   */
  readonly l1DataFeeWei?: bigint;
  readonly lestVed: number;
}

/** Pris på kjedens nativ-eiendel, i cent per hele enhet (18 desimaler antatt). */
export interface NativPris {
  readonly centPerEnhet: UsdCent;
  readonly desimaler: number;
}

/** Øvre grense for basefee etter `blokker` blokker med maksimal økning. */
export function baseFeeTak(baseFeeWei: WeiPerGass, blokker: number): WeiPerGass {
  if (!Number.isInteger(blokker) || blokker < 0) {
    throw new PengeFeil(`blokker må være et ikke-negativt heltall, fikk ${blokker}`);
  }
  if (blokker > 64) {
    throw new PengeFeil(`urimelig horisont: ${blokker} blokker`);
  }
  return (baseFeeWei * 9n ** BigInt(blokker)) / 8n ** BigInt(blokker);
}

export interface GassBudsjett {
  /** Kostnad til dagens basefee. Brukes til regnskap, ikke til porten. */
  readonly forventetWei: bigint;
  /** Kostnad hvis basefee går i taket før inkludering. Porten bruker denne. */
  readonly maksWei: bigint;
  /** L1-datadelen av maksWei, for L2. Null på L1. */
  readonly l1DataDelWei: bigint;
  readonly forventetUsd: UsdCent;
  readonly maksUsd: UsdCent;
  /** `maxFeePerGas` som skal settes i transaksjonen. */
  readonly maxFeePerGas: WeiPerGass;
  readonly maxPriorityFeePerGas: WeiPerGass;
}

export interface GassValg {
  /**
   * Hvor mange blokker vi antar det tar før inkludering, i verste fall.
   * Privat ruting via bygger sikter typisk på 1–3 blokker; 4 gir margin.
   */
  readonly horisontBlokker: number;
}

export const STANDARD_GASS: GassValg = Object.freeze({ horisontBlokker: 4 });

function weiTilCent(wei: bigint, pris: NativPris): UsdCent {
  // Rund opp: en kostnad som rundes ned kan snike en operasjon gjennom porten.
  const skala = 10n ** BigInt(pris.desimaler);
  const teller = wei * pris.centPerEnhet;
  return (teller + skala - 1n) / skala;
}

/**
 * Beregn gassbudsjett for én transaksjon.
 *
 * `gassGrense` skal komme fra en faktisk simulering (`eth_estimateGas` eller
 * bundle-simulering), ikke fra en konstant. En hardkodet gassgrense er feil i
 * det øyeblikket en rute går gjennom ett hopp mer enn forventet.
 */
export function beregnGass(
  gassGrense: bigint,
  tilstand: GassTilstand,
  pris: NativPris,
  valg: GassValg = STANDARD_GASS,
): GassBudsjett {
  if (gassGrense <= 0n) throw new PengeFeil(`gassgrense må være positiv, fikk ${gassGrense}`);
  if (tilstand.baseFeeWei < 0n || tilstand.prioritetWei < 0n) {
    throw new PengeFeil("negative gasspriser");
  }
  if (ER_L2[tilstand.kjede] && tilstand.l1DataFeeWei === undefined) {
    throw new PengeFeil(
      `${tilstand.kjede} er L2: l1DataFeeWei må hentes fra gassprisorakelet. ` +
        `Uten den er totalkostnaden systematisk underestimert.`,
    );
  }

  const takBase = baseFeeTak(tilstand.baseFeeWei, valg.horisontBlokker);
  const maxFeePerGas = takBase + tilstand.prioritetWei;

  const utforelseForventet = gassGrense * (tilstand.baseFeeWei + tilstand.prioritetWei);
  const utforelseMaks = gassGrense * maxFeePerGas;

  // L1-datadelen svinger med L1s egen basefee, så den får samme tak.
  const l1Forventet = tilstand.l1DataFeeWei ?? 0n;
  const l1Maks = baseFeeTak(l1Forventet, valg.horisontBlokker);

  const forventetWei = utforelseForventet + l1Forventet;
  const maksWei = utforelseMaks + l1Maks;

  return {
    forventetWei,
    maksWei,
    l1DataDelWei: l1Maks,
    forventetUsd: weiTilCent(forventetWei, pris),
    maksUsd: weiTilCent(maksWei, pris),
    maxFeePerGas,
    maxPriorityFeePerGas: tilstand.prioritetWei,
  };
}
