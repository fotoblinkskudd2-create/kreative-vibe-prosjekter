/**
 * Lommebok-isolasjon — brannceller for katalysatoren.
 *
 * Hva dette faktisk oppnår, og hva det ikke oppnår. Begge deler betyr noe for
 * hvordan du dimensjonerer resten.
 *
 * OPPNÅR — begrenset skadeomfang. Dette er den virkelige gevinsten og den er
 * stor. En honeypot-kontrakt, en ondsinnet `approve`, en kompromittert rute:
 * angrepet rekker aldri lenger enn det hvelvet som signerte. Fem hvelv betyr at
 * verste enkelthendelse koster en femtedel, ikke alt. Det er en reell grunn til
 * å gjøre dette.
 *
 * OPPNÅR IKKE — anonymitet. «Slette eierskapsspor» er ikke mulig på denne måten,
 * og det er viktig at systemet ikke opptrer som om det var. Finansierer du fem
 * hvelv fra én kilde, har du tegnet en stjerne i kjedens permanente
 * transaksjonsgraf. Enhver klyngeanalyse binder dem sammen umiddelbart — på
 * finansieringstransaksjonen alene, før den i tillegg ser tidsmønsteret og de
 * felles motpartene. Hvelvene er engangsbruk mot *smartkontrakter*, ikke mot en
 * observatør. Bygg ingen antakelse om usporbarhet oppå dette.
 *
 * DEN VIKTIGE KONFLIKTEN — fragmentering slår mot Skattemesteren, hardt.
 * Splitter du katalysatoren i fem, blir hver handel en femtedel så stor. Gassen
 * per handel er uendret. Friksjonsandelen femdobles dermed omtrent, og
 * Skattemesterens 5 %-port er i praksis et krav om at brutto er 20x friksjonen.
 * Fragmenteringen kan altså gjøre at *ingen* operasjon passerer porten, og
 * symptomet vil se ut som «arbitrasjen finnes ikke» i stedet for «vi delte
 * kapitalen for tynt».
 *
 * `minsteHvelvSaldo` regner ut grensen eksplisitt, og `planleggIsolasjon` nekter
 * å splitte under den. Antall brannceller er en avveining mot levedyktighet, og
 * den avveiningen skal være et tall, ikke en preferanse.
 *
 * NØKLER — dette modulen håndterer ikke. Den arbeider med *referanser* til
 * signeringsevne (adresse + et håndtak), aldri med nøkkelmateriale. Nøkler skal
 * komme fra en HSM, en KMS eller en BIP-32-avledning der frøet ligger utenfor
 * dette repoet. Å generere engangsnøkler i applikasjonskode er å plassere
 * hele katalysatoren i prosessminnet til den delen av systemet som har størst
 * angrepsflate.
 */

import { BPS, PengeFeil, andelBps } from "../kjerne/penger.ts";
import type { UsdCent } from "../kjerne/penger.ts";

/** Referanse til et hvelv. Ingen nøkler her — kun identitet og signeringshåndtak. */
export interface Hvelv {
  readonly id: string;
  readonly adresse: string;
  /** Ugjennomsiktig håndtak til den eksterne signereren (KMS/HSM-nøkkel-id). */
  readonly signererHandtak: string;
  /** Tildelt kapital i cent. */
  readonly tildeltCent: UsdCent;
  /** Antall handler utført fra dette hvelvet. */
  readonly handler: number;
  readonly status: "aktiv" | "pensjonert" | "kompromittert";
}

/**
 * Minste kapital et hvelv må ha for at operasjoner fra det kan passere
 * Skattemesterens friksjonsport.
 *
 * Utledning: porten krever `friksjon / brutto <= t`, altså `brutto >= friksjon / t`.
 * Med `brutto = innsats * margin` gir det
 *
 *   innsats >= friksjon / (t * margin)
 *
 * som i basispunkter blir `friksjon * BPS * BPS / (t * margin)`.
 *
 * Tallet er ubehagelig stort, og det er poenget: med 3 USD friksjon, 5 %-port og
 * 1 % forventet margin må hvert hvelv ha rundt 6 000 USD for at noe som helst
 * skal kunne passere. En katalysator som ikke tåler det, tåler ikke fem hvelv.
 */
export function minsteHvelvSaldo(
  friksjonPerOperasjonCent: UsdCent,
  maksFriksjonBps: bigint,
  forventetMarginBps: bigint,
): UsdCent {
  if (maksFriksjonBps <= 0n) throw new PengeFeil("friksjonstaket må være positivt");
  if (forventetMarginBps <= 0n) throw new PengeFeil("forventet margin må være positiv");
  const teller = friksjonPerOperasjonCent * BPS * BPS;
  const nevner = maksFriksjonBps * forventetMarginBps;
  return (teller + nevner - 1n) / nevner;
}

export interface IsolasjonsValg {
  /** Ønsket antall brannceller. */
  readonly onsketAntall: number;
  /** Handler før et hvelv pensjoneres og kapitalen flyttes videre. */
  readonly handlerForRotasjon: number;
  /** Ingen enkelt operasjon får bruke mer enn denne andelen av et hvelv. */
  readonly maksEksponeringPerHandelBps: bigint;
  /** Anslått friksjon per operasjon, for levedyktighetsberegningen. */
  readonly friksjonPerOperasjonCent: UsdCent;
  readonly maksFriksjonBps: bigint;
  readonly forventetMarginBps: bigint;
  /** Gasskostnad for å finansiere ett hvelv. Betales per branncelle. */
  readonly finansieringsgassCent: UsdCent;
}

export const STANDARD_ISOLASJON: IsolasjonsValg = Object.freeze({
  onsketAntall: 5,
  handlerForRotasjon: 1,
  maksEksponeringPerHandelBps: 5_000n, // halvparten av hvelvet per handel
  friksjonPerOperasjonCent: 300n,
  maksFriksjonBps: 500n,
  forventetMarginBps: 100n,
  finansieringsgassCent: 150n,
});

export interface Isolasjonsplan {
  /** Antall brannceller planen faktisk anbefaler. */
  readonly antall: number;
  readonly perHvelvCent: UsdCent;
  /** Minstekravet per hvelv, gitt friksjon og margin. */
  readonly minsteSaldoCent: UsdCent;
  /** Total gasskostnad for å opprette og finansiere branncellene. */
  readonly oppsettskostnadCent: UsdCent;
  /** Ble antallet redusert fra det ønskede, og hvorfor? */
  readonly avvik: string | null;
  readonly levedyktig: boolean;
}

/**
 * Legg en isolasjonsplan som både gir brannceller og lar operasjoner passere
 * friksjonsporten. Reduserer antallet når det er nødvendig framfor å levere en
 * oppdeling der ingenting kan handles.
 */
export function planleggIsolasjon(
  katalysatorCent: UsdCent,
  valg: IsolasjonsValg = STANDARD_ISOLASJON,
): Isolasjonsplan {
  if (katalysatorCent <= 0n) throw new PengeFeil("katalysatoren må være positiv");
  if (valg.onsketAntall < 1) throw new PengeFeil("antall hvelv må være minst 1");

  const minste = minsteHvelvSaldo(
    valg.friksjonPerOperasjonCent,
    valg.maksFriksjonBps,
    valg.forventetMarginBps,
  );

  // Hvor mange hvelv har råd til å eksistere, gitt minstekravet?
  const maksAntall = Number(katalysatorCent / minste);
  let antall = Math.min(valg.onsketAntall, Math.max(0, maksAntall));
  let avvik: string | null = null;

  if (antall < 1) {
    // Ikke engang ett hvelv holder minstekravet. Da er ikke problemet
    // oppdelingen — det er at kapitalen er for liten for friksjonsnivået.
    return {
      antall: 1,
      perHvelvCent: katalysatorCent,
      minsteSaldoCent: minste,
      oppsettskostnadCent: valg.finansieringsgassCent,
      avvik:
        `hele katalysatoren på ${katalysatorCent} cent er under minstekravet ` +
        `${minste} cent for ett enkelt hvelv. Ingen oppdeling er levedyktig. ` +
        `Flytt til en kjede med lavere friksjon, eller øk marginkravet — ` +
        `${valg.forventetMarginBps} bp margin bærer ikke ${valg.friksjonPerOperasjonCent} cent friksjon.`,
      levedyktig: false,
    };
  }

  if (antall < valg.onsketAntall) {
    avvik =
      `redusert fra ${valg.onsketAntall} til ${antall} brannceller: ` +
      `${valg.onsketAntall} hvelv ville gitt ${katalysatorCent / BigInt(valg.onsketAntall)} cent ` +
      `hver, under minstekravet ${minste} cent. Fragmenteringen ville drept ` +
      `hver operasjon på Skattemesterens friksjonsport.`;
  }

  const oppsett = valg.finansieringsgassCent * BigInt(antall);
  const tilgjengelig = katalysatorCent - oppsett;
  if (tilgjengelig <= 0n) {
    antall = 1;
    return {
      antall,
      perHvelvCent: katalysatorCent - valg.finansieringsgassCent,
      minsteSaldoCent: minste,
      oppsettskostnadCent: valg.finansieringsgassCent,
      avvik: `oppsettsgassen for ${valg.onsketAntall} hvelv overstiger katalysatoren`,
      levedyktig: false,
    };
  }

  return {
    antall,
    perHvelvCent: tilgjengelig / BigInt(antall),
    minsteSaldoCent: minste,
    oppsettskostnadCent: oppsett,
    avvik,
    levedyktig: true,
  };
}

/** Største beløp én operasjon får bruke fra et hvelv. */
export function maksEksponering(hvelv: Hvelv, valg: IsolasjonsValg): UsdCent {
  return andelBps(hvelv.tildeltCent, valg.maksEksponeringPerHandelBps);
}

/**
 * Rullerende utvalg av hvelv.
 *
 * Rotasjonen er ikke der for å skjule eierskap — den er der for at en
 * kompromittert godkjenning skal ha kort levetid. Et hvelv som har signert mot
 * en ukjent kontrakt pensjoneres, uansett om handelen gikk bra.
 */
export class Hvelvrotasjon {
  private hvelv: Hvelv[];
  private peker = 0;

  constructor(
    hvelv: readonly Hvelv[],
    private readonly valg: IsolasjonsValg = STANDARD_ISOLASJON,
  ) {
    if (hvelv.length === 0) throw new PengeFeil("ingen hvelv å rotere mellom");
    this.hvelv = [...hvelv];
  }

  /** Neste aktive hvelv med nok kapital, eller null. */
  neste(kravCent: UsdCent): Hvelv | null {
    for (let i = 0; i < this.hvelv.length; i++) {
      const kandidat = this.hvelv[(this.peker + i) % this.hvelv.length]!;
      if (kandidat.status !== "aktiv") continue;
      if (maksEksponering(kandidat, this.valg) < kravCent) continue;
      this.peker = (this.peker + i + 1) % this.hvelv.length;
      return kandidat;
    }
    return null;
  }

  /** Bokfør en utført handel og pensjoner hvelvet når kvoten er nådd. */
  bokfor(id: string): Hvelv {
    const indeks = this.hvelv.findIndex((h) => h.id === id);
    if (indeks === -1) throw new PengeFeil(`ukjent hvelv: ${id}`);
    const gammelt = this.hvelv[indeks]!;
    const handler = gammelt.handler + 1;
    const oppdatert: Hvelv = {
      ...gammelt,
      handler,
      status: handler >= this.valg.handlerForRotasjon ? "pensjonert" : gammelt.status,
    };
    this.hvelv[indeks] = oppdatert;
    return oppdatert;
  }

  /** Merk et hvelv som kompromittert. Det brukes aldri igjen. */
  kompromittert(id: string): void {
    const indeks = this.hvelv.findIndex((h) => h.id === id);
    if (indeks === -1) throw new PengeFeil(`ukjent hvelv: ${id}`);
    this.hvelv[indeks] = { ...this.hvelv[indeks]!, status: "kompromittert" };
  }

  /**
   * Hvorfor `neste()` ikke fant et hvelv. Kun for feilmeldinger — «ingen hvelv
   * tilgjengelig» er ubrukelig i en logg, mens «alle fire er pensjonert» og
   * «alle fire er for små» krever helt ulike tiltak.
   */
  diagnose(kravCent: UsdCent): {
    readonly totalt: number;
    readonly pensjonerte: number;
    readonly kompromitterte: number;
    readonly forSmaa: number;
  } {
    let pensjonerte = 0;
    let kompromitterte = 0;
    let forSmaa = 0;
    for (const h of this.hvelv) {
      if (h.status === "pensjonert") pensjonerte += 1;
      else if (h.status === "kompromittert") kompromitterte += 1;
      else if (maksEksponering(h, this.valg) < kravCent) forSmaa += 1;
    }
    return { totalt: this.hvelv.length, pensjonerte, kompromitterte, forSmaa };
  }

  get aktive(): readonly Hvelv[] {
    return this.hvelv.filter((h) => h.status === "aktiv");
  }

  get alle(): readonly Hvelv[] {
    return this.hvelv;
  }
}

/**
 * Godkjenningshygiene — det faktiske honeypot-forsvaret.
 *
 * Isolasjon begrenser skaden. Dette begrenser sannsynligheten. Uendelige
 * `approve`-kall er den enkeltårsaken som tømmer flest lommebøker, og en
 * pensjonert lommebok med en levende uendelig godkjenning er ikke pensjonert i
 * det hele tatt — den kan tømmes måneder senere.
 */
export interface Godkjenningsregel {
  readonly tillatUendelig: false;
  /** Godkjenn kun nøyaktig beløpet handelen trenger. */
  readonly noyaktigBelop: true;
  /** Trekk tilbake godkjenningen etter handelen, i samme sekvens. */
  readonly trekkTilbakeEtterpaa: true;
  /** Foretrekk Permit2-signaturer med utløpstid framfor `approve`. */
  readonly foretrekkPermitMedUtlop: true;
  /** Maksimal levetid på en Permit2-signatur. */
  readonly maksUtlopSek: number;
}

export const GODKJENNINGSREGEL: Godkjenningsregel = Object.freeze({
  tillatUendelig: false,
  noyaktigBelop: true,
  trekkTilbakeEtterpaa: true,
  foretrekkPermitMedUtlop: true,
  maksUtlopSek: 120,
});

export const UENDELIG_UINT256 = (1n << 256n) - 1n;

/** Avvis en godkjenning som bryter regelen. Kaster med årsak. */
export function sjekkGodkjenning(belop: bigint, handelensBehov: bigint): void {
  if (belop >= UENDELIG_UINT256 / 2n) {
    throw new PengeFeil(
      "uendelig godkjenning avvist: en pensjonert lommebok med levende " +
        "uendelig approve kan tømmes lenge etter at den ble tatt ut av rotasjon",
    );
  }
  if (belop > handelensBehov) {
    throw new PengeFeil(
      `godkjenning ${belop} overstiger handelens behov ${handelensBehov}; ` +
        "godkjenn nøyaktig beløp",
    );
  }
}
