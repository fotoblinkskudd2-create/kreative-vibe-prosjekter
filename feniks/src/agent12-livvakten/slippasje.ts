/**
 * Eksakt slippasjeberegning for konstantprodukt-basseng (Uniswap V2-semantikk).
 *
 * Alt er heltallsaritmetikk med samme avrundingsretning som kontraktene selv
 * bruker, slik at `forventetUt` her er identisk med det kjeden ville returnert
 * for samme reserver. Avviker vi med én grunnenhet, avviker `minUt` også, og
 * da er MEV-grensen i mev.ts feil.
 *
 * Formel, med gebyr f uttrykt i basispunkter:
 *
 *   innEtterGebyr = inn * (10000 - f)
 *   ut            = (innEtterGebyr * reserveUt) / (reserveInn * 10000 + innEtterGebyr)
 *
 * Uniswap V2 bruker 997/1000; med f = 30 bp blir (10000-30)/10000 = 997/1000
 * eksakt, så uttrykket er ikke en tilnærming.
 */

import { BPS, PengeFeil, minusBps, tilBps } from "../kjerne/penger.ts";
import type { Basseng } from "../kjerne/typer.ts";
import type { Grunnenhet } from "../kjerne/penger.ts";

export interface Slippasje {
  /** Hva bassenget gir ved uendrede reserver. */
  readonly forventetUt: Grunnenhet;
  /**
   * Hva vi minst godtar. Alt mellom denne og `forventetUt` er verdi en
   * angriper kan hente ut — se mev.ts.
   */
  readonly minUt: Grunnenhet;
  /** Toleransen som ble brukt, i basispunkter. */
  readonly toleranseBps: bigint;
  /** Tap fra bassengets gebyr alene, i grunnenheter av ut-eiendelen. */
  readonly gebyrtapUt: Grunnenhet;
  /**
   * Tap fra handelens egen dybdepåvirkning, målt mot en gebyrjustert
   * nullimpakt-referanse. Skilt fra gebyret fordi de to skaleres ulikt:
   * gebyret er lineært i handelsstørrelse, dybdepåvirkningen er ikke.
   */
  readonly prisimpaktBps: bigint;
  /** Gebyr + dybdepåvirkning samlet, mot spotpris. */
  readonly totalkostnadBps: bigint;
}

/** Bassengets utbetaling for et gitt innbeløp. Speiler kontraktens avrunding. */
export function utBelop(
  inn: Grunnenhet,
  reserveInn: Grunnenhet,
  reserveUt: Grunnenhet,
  gebyrBps: bigint,
): Grunnenhet {
  if (inn <= 0n) throw new PengeFeil(`innbeløp må være positivt, fikk ${inn}`);
  if (reserveInn <= 0n || reserveUt <= 0n) {
    throw new PengeFeil(`tomt basseng: inn=${reserveInn} ut=${reserveUt}`);
  }
  if (gebyrBps < 0n || gebyrBps >= BPS) {
    throw new PengeFeil(`ugyldig bassenggebyr: ${gebyrBps} bp`);
  }
  const innEtterGebyr = inn * (BPS - gebyrBps);
  return (innEtterGebyr * reserveUt) / (reserveInn * BPS + innEtterGebyr);
}

/**
 * Innbeløpet som kreves for å få *minst* `onsketUt` ut. Motsatt avrunding
 * (oppover), ellers bommer vi med én enhet og handelen reverterer.
 */
export function innBelop(
  onsketUt: Grunnenhet,
  reserveInn: Grunnenhet,
  reserveUt: Grunnenhet,
  gebyrBps: bigint,
): Grunnenhet {
  if (onsketUt <= 0n) throw new PengeFeil(`ønsket utbeløp må være positivt, fikk ${onsketUt}`);
  if (onsketUt >= reserveUt) {
    throw new PengeFeil(`ønsket utbeløp ${onsketUt} overstiger reserve ${reserveUt}`);
  }
  const teller = reserveInn * onsketUt * BPS;
  const nevner = (reserveUt - onsketUt) * (BPS - gebyrBps);
  return teller / nevner + 1n;
}

/**
 * Referansen «hva ville vi fått uten dybdepåvirkning, men med gebyr».
 * Brukt for å isolere prisimpakt fra gebyr.
 */
function nullimpaktUt(inn: Grunnenhet, basseng: Basseng): Grunnenhet {
  const spot = (inn * basseng.reserveUt) / basseng.reserveInn;
  return minusBps(spot, basseng.gebyrBps);
}

/** Full slippasjedekomponering for én handel. */
export function beregnSlippasje(
  inn: Grunnenhet,
  basseng: Basseng,
  toleranseBps: bigint,
): Slippasje {
  if (toleranseBps < 0n || toleranseBps >= BPS) {
    throw new PengeFeil(`ugyldig slippasjetoleranse: ${toleranseBps} bp`);
  }

  const forventetUt = utBelop(inn, basseng.reserveInn, basseng.reserveUt, basseng.gebyrBps);
  if (forventetUt === 0n) {
    throw new PengeFeil(
      `handelen gir null ut — innbeløpet ${inn} er for lite for bassengets reserver`,
    );
  }

  const spotUt = (inn * basseng.reserveUt) / basseng.reserveInn;
  const referanseUt = nullimpaktUt(inn, basseng);

  return {
    forventetUt,
    minUt: minusBps(forventetUt, toleranseBps),
    toleranseBps,
    gebyrtapUt: spotUt - referanseUt,
    prisimpaktBps: referanseUt === 0n ? 0n : tilBps(referanseUt - forventetUt, referanseUt),
    totalkostnadBps: spotUt === 0n ? 0n : tilBps(spotUt - forventetUt, spotUt),
  };
}

/**
 * Reservene etter at et innbeløp er byttet inn. Trengs for å simulere en
 * angripers front-run i mev.ts.
 */
export function bassengEtter(inn: Grunnenhet, basseng: Basseng): Basseng {
  const ut = utBelop(inn, basseng.reserveInn, basseng.reserveUt, basseng.gebyrBps);
  return { ...basseng, reserveInn: basseng.reserveInn + inn, reserveUt: basseng.reserveUt - ut };
}
