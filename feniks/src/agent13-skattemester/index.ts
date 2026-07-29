/**
 * Agent 13 — Skattemesteren.
 *
 * Kjører før Eksekutøren og før Livvakten: det er ingen grunn til å bruke tid på
 * MEV-analyse av en operasjon som er død på avgifter.
 *
 * Porten er den du spesifiserte — friksjon over 5 % av brutto dreper
 * operasjonen — med tre tillegg som følger av å faktisk regne på den:
 *
 *  1. Nettokrav i tillegg til forholdstall. En operasjon med brutto 100 cent og
 *     friksjon 4 cent passerer 5 %-regelen, men hvis anslaget bommer med 5 cent
 *     er den negativ. Forholdstall alene er ikke nok; netto må være positiv med
 *     margin.
 *
 *  2. Kapitalbinding er friksjon. Låser en operasjon innsatsen i 40 minutter,
 *     er kapitalen utilgjengelig for alle andre operasjoner i mellomtiden. På en
 *     katalysator som skal roteres mange ganger per syklus er det den dyreste
 *     posten, og den står ikke i noe gebyrskjema.
 *
 *  3. En 5 %-terskel er en 20x-regel. `friksjon / brutto <= 0,05` er identisk
 *     med `brutto >= 20 * friksjon`. Med 3 USD gass tur-retur betyr det at
 *     ingen operasjon under 60 USD brutto noensinne kan passere. Det er ikke en
 *     innvending mot regelen — den er riktig — men det er tallet som avgjør om
 *     modellen kan kjøre på L1 i det hele tatt. `minimumLonnsomBrutto` regner
 *     det ut eksplisitt, og porten logger det ved hvert drap, slik at det er
 *     synlig hvorfor operasjoner dør i stedet for bare at de gjør det.
 */

import { BPS, andelBps, tilBps } from "../kjerne/penger.ts";
import type { UsdCent } from "../kjerne/penger.ts";
import { drept, godkjent } from "../kjerne/typer.ts";
import type { BruttoMulighet, Dom } from "../kjerne/typer.ts";
import { stilleLogg, type Logg } from "../kjerne/logg.ts";
import { ledd, summerFriksjon, type Friksjonsledd, type Friksjonsregnskap } from "./gebyrer.ts";

export interface SkattemesterValg {
  /** Friksjonstaket. 500 bp = 5 %. */
  readonly maksFriksjonBps: bigint;
  /**
   * Påslag på anslåtte ledd før de måles mot taket. Anslag bommer, og de bommer
   * oftere oppover enn nedover — gasspiker har ingen motsats.
   */
  readonly anslagspaaslagBps: bigint;
  /**
   * Årlig alternativavkastning på bundet kapital, i basispunkter. Brukes til å
   * prise kapitalbindingen over operasjonens levetid.
   */
  readonly kapitalkostnadAarligBps: bigint;
  /** Netto må minst utgjøre denne andelen av brutto etter alt. */
  readonly minNettoAvBruttoBps: bigint;
}

export const STANDARD_SKATTEMESTER: SkattemesterValg = Object.freeze({
  maksFriksjonBps: 500n, // 5 %
  anslagspaaslagBps: 2_000n, // +20 % på anslåtte ledd
  kapitalkostnadAarligBps: 1_000n, // 10 % årlig
  minNettoAvBruttoBps: 1_000n, // netto >= 10 % av brutto
});

const MS_PER_AAR = 365n * 24n * 60n * 60n * 1000n;

/**
 * Prisen på å ha `innsatsCent` bundet i `levetidMs`. Lineær tidsvekting av
 * alternativavkastningen — ikke fordi kapitalkostnad er lineær, men fordi
 * horisonten er minutter og enhver renteeffekt over minutter er støy mot
 * gassvariasjonen.
 */
export function kapitalbinding(
  innsatsCent: UsdCent,
  levetidMs: number,
  aarligBps: bigint,
): UsdCent {
  if (levetidMs <= 0) return 0n;
  const aarlig = andelBps(innsatsCent, aarligBps);
  return (aarlig * BigInt(Math.round(levetidMs))) / MS_PER_AAR;
}

/**
 * Minste bruttofortjeneste som kan passere friksjonstaket.
 * Inversjonen av `friksjon / brutto <= terskel`.
 */
export function minimumLonnsomBrutto(friksjonCent: UsdCent, maksFriksjonBps: bigint): UsdCent {
  if (maksFriksjonBps <= 0n) return 0n;
  return (friksjonCent * BPS + maksFriksjonBps - 1n) / maksFriksjonBps;
}

export interface Friksjonsdom {
  readonly dom: Dom;
  readonly regnskap: Friksjonsregnskap;
  /** Friksjon etter påslag på anslåtte ledd. Dette er tallet porten måler. */
  readonly friksjonMedPaaslagCent: UsdCent;
  readonly nettoCent: UsdCent;
  readonly friksjonsandelBps: bigint;
  /** Terskelen for at denne operasjonen kunne passert. */
  readonly minimumBruttoCent: UsdCent;
  /** ROI etter friksjon, i basispunkter av innsats. */
  readonly nettoRoiBps: bigint;
}

export class Skattemester {
  constructor(
    private readonly valg: SkattemesterValg = STANDARD_SKATTEMESTER,
    private readonly logg: Logg = stilleLogg,
  ) {}

  /**
   * Vurder en mulighet mot alle kjente avgifter.
   *
   * `avgifter` er alle gass-, plattform-, frakt- og brogebyrer for operasjonen.
   * Kapitalbindingen legges til her, slik at den ikke kan glemmes av kalleren.
   */
  vurder(mulighet: BruttoMulighet, avgifter: readonly Friksjonsledd[]): Friksjonsdom {
    const logg = this.logg.med({ operasjon: mulighet.id, kjede: mulighet.kjede });

    const binding = kapitalbinding(
      mulighet.innsatsUsd,
      mulighet.levetidMs,
      this.valg.kapitalkostnadAarligBps,
    );
    const alle: Friksjonsledd[] = [
      ...avgifter,
      ledd("kapitalbinding", binding, "anslag"),
    ];
    const regnskap = summerFriksjon(alle);

    // Påslag kun på de anslåtte leddene. Kjente kostnader trenger ingen buffer.
    const anslaatt = alle
      .filter((l) => l.sikkerhet === "anslag")
      .reduce((a, l) => a + l.cent, 0n);
    const medPaaslag = regnskap.totaltCent + andelBps(anslaatt, this.valg.anslagspaaslagBps);

    const netto = mulighet.bruttoUsd - medPaaslag;
    const andel = mulighet.bruttoUsd === 0n ? BPS : tilBps(medPaaslag, mulighet.bruttoUsd);
    const minimumBrutto = minimumLonnsomBrutto(medPaaslag, this.valg.maksFriksjonBps);
    const nettoRoi = mulighet.innsatsUsd === 0n ? 0n : tilBps(netto, mulighet.innsatsUsd);

    const grunnlag: Omit<Friksjonsdom, "dom"> = {
      regnskap,
      friksjonMedPaaslagCent: medPaaslag,
      nettoCent: netto,
      friksjonsandelBps: andel,
      minimumBruttoCent: minimumBrutto,
      nettoRoiBps: nettoRoi,
    };

    const bilag = {
      bruttoCent: mulighet.bruttoUsd,
      friksjonCent: medPaaslag,
      nettoCent: netto,
      friksjonsandelBps: andel,
      minimumBruttoCent: minimumBrutto,
      ledd: alle.map((l) => ({ navn: l.navn, cent: l.cent, sikkerhet: l.sikkerhet })),
    };

    if (mulighet.bruttoUsd <= 0n) {
      const dom = drept("ingen-brutto", "muligheten har ingen positiv bruttofortjeneste");
      logg.varsel("operasjon drept", { arsak: dom.arsak, ...bilag });
      return { ...grunnlag, dom };
    }

    if (netto <= 0n) {
      const dom = drept(
        "negativ-netto",
        `friksjon ${medPaaslag} cent overstiger brutto ${mulighet.bruttoUsd} cent`,
      );
      logg.varsel("operasjon drept", { arsak: dom.arsak, ...bilag });
      return { ...grunnlag, dom };
    }

    if (andel > this.valg.maksFriksjonBps) {
      const dom = drept(
        "friksjon-over-tak",
        `friksjon er ${andel} bp av brutto, taket er ${this.valg.maksFriksjonBps} bp. ` +
          `Operasjonen måtte hatt minst ${minimumBrutto} cent brutto for å passere ` +
          `(${BPS / this.valg.maksFriksjonBps}x friksjonen).`,
      );
      logg.varsel("operasjon drept", { arsak: dom.arsak, ...bilag });
      return { ...grunnlag, dom };
    }

    const nettokrav = andelBps(mulighet.bruttoUsd, this.valg.minNettoAvBruttoBps);
    if (netto < nettokrav) {
      const dom = drept(
        "netto-under-minstekrav",
        `netto ${netto} cent er under minstekravet ${nettokrav} cent`,
      );
      logg.varsel("operasjon drept", { arsak: dom.arsak, ...bilag });
      return { ...grunnlag, dom };
    }

    const dom = godkjent(
      "godkjent",
      `netto ${netto} cent, friksjon ${andel} bp av brutto, netto-ROI ${nettoRoi} bp`,
    );
    logg.info("operasjon godkjent", { arsak: dom.arsak, ...bilag, nettoRoiBps: nettoRoi });
    return { ...grunnlag, dom };
  }
}

export * from "./gass.ts";
export * from "./gebyrer.ts";
