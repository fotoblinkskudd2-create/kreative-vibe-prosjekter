/**
 * Grensen for hva en sandwich kan stjele.
 *
 * Rettelse av premisset: det finnes ingen «matematisk sikkerhet» mot MEV. En
 * transaksjon som havner i en blokk er alltid underlagt byggerens
 * rekkefølgevalg. Det som *kan* garanteres matematisk er en øvre grense for
 * hvor mye verdi en angriper kan trekke ut — og at grensen ligger under hva
 * angrepet koster angriperen. Da uteblir angrepet av økonomiske grunner, ikke
 * fordi det er umulig.
 *
 * Grensen er slippasjevinduet:
 *
 *   vindu = forventetUt - minUt
 *
 * En sandwich fungerer ved å skyve prisen før din handel. Skyves den så langt
 * at du får mindre enn `minUt`, reverterer handelen din og angriperen sitter
 * igjen med to gebyrer og null bytte. Angriperens optimale front-run er derfor
 * nøyaktig den som presser deg til `minUt` — ikke mer. Alt hen kan hente *fra
 * deg* er det du på forhånd sa deg villig til å tape.
 *
 * VIKTIG PRESISERING: `vindu` begrenser *ditt tap*. Det begrenser ikke
 * angriperens inntekt. En sandwich henter fra to kilder — din slippasje, og
 * bassengets skjevhet etter angrepet, som er LP-enes verdi. Målt i et konsistent
 * USD-numerær tjener angriperen målbart *mer* enn du taper: i testtilfellet i
 * `mev.test.ts` er tapet 427,34 USD mens angriperens brutto er 441,12 USD.
 *
 * Det har en konkret konsekvens for porten under. Det som avgjør *om* du blir
 * angrepet er angriperens inntekt, ikke ditt tap — så en port som sammenligner
 * `vindu` direkte med angriperens gasskostnad er systematisk litt for optimistisk.
 * Det er nettopp derfor `marginBps` finnes og står på 5 000: vi krever at
 * vinduet ligger under *halvparten* av angriperens kostnad, slik at differansen
 * mellom ditt tap og hens inntekt får rom. Marginen er ikke forsiktighet på
 * magefølelse — den dekker en kjent skjevhet i grensen.
 *
 * `simulerSandwich` verifiserer den delen som faktisk holder: at ditt tap aldri
 * overstiger vinduet, uansett hvor optimalt angrepet utføres.
 */

import { BPS, PengeFeil } from "../kjerne/penger.ts";
import type { Grunnenhet, UsdCent } from "../kjerne/penger.ts";
import type { Basseng } from "../kjerne/typer.ts";
import { bassengEtter, utBelop, type Slippasje } from "./slippasje.ts";

/** Pris på en eiendel, i cent per hele enhet. */
export interface Pris {
  readonly centPerEnhet: UsdCent;
  readonly desimaler: number;
}

/** Verdien av et beløp i grunnenheter, uttrykt i cent. */
export function verdiUsd(belop: Grunnenhet, pris: Pris): UsdCent {
  return (belop * pris.centPerEnhet) / 10n ** BigInt(pris.desimaler);
}

export interface AngriperModell {
  /**
   * Angriperens gasskostnad for hele sandwichen (front-run + back-run),
   * i cent. Dette er hens *terskel*: er vinduet mindre enn dette, taper hen
   * penger på å angripe deg.
   */
  readonly gasskostnadUsd: UsdCent;
  /**
   * Sikkerhetsmargin i basispunkter over gasskostnaden. En angriper med
   * allerede varm kapital og en optimalisert bundle angriper også for tynn
   * margin, så vi krever at vinduet ligger et stykke under kostnaden.
   * 5 000 bp = krev at vinduet er under halvparten av angriperens kostnad.
   */
  readonly marginBps: bigint;
}

export const STANDARD_ANGRIPER: AngriperModell = Object.freeze({
  // Konservativt: en enkel sandwich på L1 til moderat basefee.
  gasskostnadUsd: 400n, // 4,00 USD
  marginBps: 5_000n,
});

export interface MevVurdering {
  /** Verdi en angriper maksimalt kan hente ut, i cent. */
  readonly vinduUsd: UsdCent;
  /** Terskelen angriperen må over for at angrepet skal lønne seg, i cent. */
  readonly angriperTerskelUsd: UsdCent;
  /** Er offentlig mempool økonomisk trygt for denne handelen? */
  readonly trygtOffentlig: boolean;
  /**
   * Høyeste slippasjetoleranse som holder vinduet under angriperens terskel.
   * `0n` betyr at ingen positiv toleranse er trygg offentlig — handelen må
   * enten rutes privat eller krympes.
   */
  readonly maksTryggToleranseBps: bigint;
}

/**
 * Vurder om et slippasjevindu er lite nok til at en sandwich ikke lønner seg.
 * Dette er den billige porten — ingen bassengsimulering, bare grensen.
 */
export function vurderMev(
  slippasje: Slippasje,
  utPris: Pris,
  angriper: AngriperModell = STANDARD_ANGRIPER,
): MevVurdering {
  const vinduUt = slippasje.forventetUt - slippasje.minUt;
  const vinduUsd = verdiUsd(vinduUt, utPris);

  const terskel = (angriper.gasskostnadUsd * angriper.marginBps) / BPS;

  // Hvor stort kan vinduet være i grunnenheter før det treffer terskelen?
  const maksVinduUt = (terskel * 10n ** BigInt(utPris.desimaler)) / utPris.centPerEnhet;
  const maksToleranse =
    slippasje.forventetUt === 0n
      ? 0n
      : (maksVinduUt * BPS) / slippasje.forventetUt;

  return {
    vinduUsd,
    angriperTerskelUsd: terskel,
    trygtOffentlig: vinduUsd < terskel,
    maksTryggToleranseBps: maksToleranse > BPS - 1n ? BPS - 1n : maksToleranse,
  };
}

export interface SandwichResultat {
  /** Angriperens optimale front-run, i grunnenheter av inn-eiendelen. */
  readonly frontRunInn: Grunnenhet;
  /** Hva offeret faktisk får når angrepet er maksimert. */
  readonly offerFikkUt: Grunnenhet;
  /** Angriperens bruttofortjeneste i inn-eiendelen, før gass. */
  readonly angriperBruttoInn: Grunnenhet;
  /** Offerets tap mot uangrepet utfall, i ut-eiendelen. */
  readonly offerTapUt: Grunnenhet;
}

/**
 * Simuler den mest lønnsomme sandwichen mot en handel, gitt at offeret har satt
 * `minUt`. Brukes til å verifisere at vindusgrensen holder — ikke i den varme
 * stien, der `vurderMev` er nok.
 *
 * Angriperens optimum finnes ved binærsøk på front-run-størrelsen: den største
 * `a` der offeret fortsatt får minst `minUt`, siden alt over får offerets
 * handel til å revertere og gjør angrepet verdiløst.
 */
export function simulerSandwich(
  offerInn: Grunnenhet,
  basseng: Basseng,
  minUt: Grunnenhet,
): SandwichResultat {
  if (minUt <= 0n) throw new PengeFeil("minUt må være positiv for å kunne begrense angrepet");

  const uangrepetUt = utBelop(offerInn, basseng.reserveInn, basseng.reserveUt, basseng.gebyrBps);
  if (uangrepetUt < minUt) {
    throw new PengeFeil(
      `handelen reverterer allerede uten angrep: ${uangrepetUt} < ${minUt}`,
    );
  }

  const offerFar = (frontRun: Grunnenhet): Grunnenhet => {
    if (frontRun === 0n) return uangrepetUt;
    const etter = bassengEtter(frontRun, basseng);
    return utBelop(offerInn, etter.reserveInn, etter.reserveUt, etter.gebyrBps);
  };

  // Øvre grense for søket: doble til offeret ville reverte.
  let hoy = offerInn > 0n ? offerInn : 1n;
  let tak = basseng.reserveInn * 4n;
  while (hoy < tak && offerFar(hoy) >= minUt) hoy *= 2n;

  // Binærsøk største front-run som holder offeret på eller over minUt.
  let lav = 0n;
  while (lav < hoy) {
    const midt = (lav + hoy + 1n) / 2n;
    if (offerFar(midt) >= minUt) lav = midt;
    else hoy = midt - 1n;
  }

  const frontRunInn = lav;
  if (frontRunInn === 0n) {
    return {
      frontRunInn: 0n,
      offerFikkUt: uangrepetUt,
      angriperBruttoInn: 0n,
      offerTapUt: 0n,
    };
  }

  // Angriperen kjøper, offeret handler, angriperen selger tilbake.
  const etterFront = bassengEtter(frontRunInn, basseng);
  const angriperHarUt = basseng.reserveUt - etterFront.reserveUt;
  const offerFikkUt = utBelop(
    offerInn,
    etterFront.reserveInn,
    etterFront.reserveUt,
    etterFront.gebyrBps,
  );
  const forBackRun = {
    ...basseng,
    reserveInn: etterFront.reserveInn + offerInn,
    reserveUt: etterFront.reserveUt - offerFikkUt,
  };
  // Back-run går i motsatt retning: ut-eiendel inn, inn-eiendel ut.
  const backRunFar = utBelop(
    angriperHarUt,
    forBackRun.reserveUt,
    forBackRun.reserveInn,
    basseng.gebyrBps,
  );

  return {
    frontRunInn,
    offerFikkUt,
    angriperBruttoInn: backRunFar - frontRunInn,
    offerTapUt: uangrepetUt - offerFikkUt,
  };
}

/**
 * Nedre grense for brukbar slippasjetoleranse.
 *
 * Under dette reverterer handler på helt normal blokk-til-blokk-drift, og en
 * revertert handel koster gass uten å gi noe. En «trygg» toleranse på 0 bp er
 * ikke sikkerhet, det er en garantert kostnad.
 */
export const MIN_BRUKBAR_TOLERANSE_BPS = 5n;

export type Tiltak = "uendret" | "strammet-toleranse" | "krympet-handel";

export interface TryggPlan {
  readonly inn: Grunnenhet;
  readonly toleranseBps: bigint;
  readonly slippasje: Slippasje;
  readonly mev: MevVurdering;
  readonly tiltak: readonly Tiltak[];
}

/**
 * Krymp handelen til `maksTryggToleranseBps` kommer over en brukbar grense.
 *
 * Merk hvorfor krymping virker: `maksTryggToleranse` er et *absolutt* takbeløp
 * (angriperens kostnad) delt på handelens utbeløp. Halveres handelen, dobles
 * derfor den toleransen som er trygg. Sammenhengen er nesten lineær, så veien
 * fra 1 bp til 100 bp krever rundt 64x mindre handel — ikke en marginal
 * justering. Derfor er gulvet her 0,1 % og ikke 1 %: skal krymping være et
 * reelt tiltak, må det få gå langt nok til å virke.
 */
export function krympTilToleranse(
  inn: Grunnenhet,
  basseng: Basseng,
  minToleranseBps: bigint,
  utPris: Pris,
  angriper: AngriperModell,
  beregn: (inn: Grunnenhet, b: Basseng, t: bigint) => Slippasje,
): Grunnenhet | null {
  const gulv = inn / 1_000n;
  let kandidat = inn;
  // 2^12 = 4096, altså godt forbi gulvet på 1/1000.
  for (let runde = 0; runde < 12; runde++) {
    if (kandidat <= 0n || kandidat < gulv) break;
    const s = beregn(kandidat, basseng, minToleranseBps);
    if (vurderMev(s, utPris, angriper).maksTryggToleranseBps >= minToleranseBps) {
      return kandidat;
    }
    kandidat /= 2n;
  }
  return null;
}

/**
 * Finn en utførbar handel som holder MEV-vinduet lukket, eller returner den
 * beste (utrygge) planen slik at kalleren kan drepe operasjonen med tall.
 *
 * Rekkefølgen på tiltakene følger av hva som faktisk virker:
 *
 *  1. Stram inn toleransen. Gratis, umiddelbart, og som regel nok. Vinduet
 *     skaleres direkte med toleransen.
 *  2. Krymp handelen. Koster fortjeneste, men hever taket for hvor stram
 *     toleranse som er utførbar. Bare nødvendig når selv den strammeste
 *     brukbare toleransen fortsatt gir et lønnsomt vindu — altså når handelen
 *     er for stor for bassengets dybde.
 */
export function planleggTrygtVindu(
  inn: Grunnenhet,
  basseng: Basseng,
  onsketToleranseBps: bigint,
  utPris: Pris,
  beregn: (inn: Grunnenhet, b: Basseng, t: bigint) => Slippasje,
  angriper: AngriperModell = STANDARD_ANGRIPER,
  tillatKrymping = true,
): TryggPlan {
  const tiltak: Tiltak[] = [];

  let gjeldendeInn = inn;
  let toleranse = onsketToleranseBps;
  let slippasje = beregn(gjeldendeInn, basseng, toleranse);
  let mev = vurderMev(slippasje, utPris, angriper);

  if (mev.trygtOffentlig) {
    return { inn: gjeldendeInn, toleranseBps: toleranse, slippasje, mev, tiltak: ["uendret"] };
  }

  // Tiltak 1: stram toleransen ned til taket, hvis taket er brukbart.
  if (mev.maksTryggToleranseBps >= MIN_BRUKBAR_TOLERANSE_BPS) {
    toleranse = mev.maksTryggToleranseBps < onsketToleranseBps
      ? mev.maksTryggToleranseBps
      : onsketToleranseBps;
    slippasje = beregn(gjeldendeInn, basseng, toleranse);
    mev = vurderMev(slippasje, utPris, angriper);
    tiltak.push("strammet-toleranse");
    if (mev.trygtOffentlig) {
      return { inn: gjeldendeInn, toleranseBps: toleranse, slippasje, mev, tiltak };
    }
  }

  // Tiltak 2: krymp handelen til en brukbar toleranse blir trygg.
  if (tillatKrymping) {
    const mindre = krympTilToleranse(
      gjeldendeInn,
      basseng,
      MIN_BRUKBAR_TOLERANSE_BPS,
      utPris,
      angriper,
      beregn,
    );
    if (mindre !== null && mindre < gjeldendeInn) {
      gjeldendeInn = mindre;
      const tak = vurderMev(
        beregn(gjeldendeInn, basseng, MIN_BRUKBAR_TOLERANSE_BPS),
        utPris,
        angriper,
      ).maksTryggToleranseBps;
      toleranse = tak < onsketToleranseBps ? tak : onsketToleranseBps;
      if (toleranse < MIN_BRUKBAR_TOLERANSE_BPS) toleranse = MIN_BRUKBAR_TOLERANSE_BPS;
      slippasje = beregn(gjeldendeInn, basseng, toleranse);
      mev = vurderMev(slippasje, utPris, angriper);
      tiltak.push("krympet-handel");
    }
  }

  return { inn: gjeldendeInn, toleranseBps: toleranse, slippasje, mev, tiltak };
}
