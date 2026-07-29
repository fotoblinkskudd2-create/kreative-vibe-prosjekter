/**
 * Kildekatalog.
 *
 * Dette er svaret på premisset «X, Temu og eBay bruker Cloudflare/Akamai, og en
 * cron-løkke blir sperret innen to timer». Premisset er riktig. Konklusjonen om
 * at løsningen er bedre unnvikelse er ikke.
 *
 * Cloudflare og Akamai er ikke gåter som løses én gang. De er motparter i et
 * kappløp der du betaler for hver runde og de betaler én gang. Et system som
 * lever på fingeravtrykk-rotasjon har en levetid målt i uker, og når det faller,
 * faller alle kilder samtidig — nøyaktig den korrelerte feilen en katalysator på
 * 309 coins ikke tåler. Verre: kontoen som eier nøklene ryker sammen med det.
 *
 * En lisensiert vei har en annen kostnadskurve. Den er kjedeligere, den er
 * kvotebegrenset, den koster penger på X — og den blir ikke sperret, fordi det
 * ikke er noe å oppdage. Kvoter er et *dimensjoneringsproblem*, og et
 * dimensjoneringsproblem kan løses med caching, prioritering og lengre
 * intervaller. En sperre kan ikke løses med noe.
 *
 * Katalogen under er derfor også en revisjon: én av de tre kildene i
 * arkitekturen har ingen lovlig programmatisk vei i det hele tatt. Det er en
 * arkitekturfeil å oppdage nå, ikke i syklus 10.
 */

/** Hvordan kilden lovlig kan leses programmatisk. */
export type Tilgangsform =
  /** Offisielt API med vilkår vi kan oppfylle. */
  | "lisensiert-api"
  /** Offentlig feed/eksport ment for maskinlesing (RSS, sitemap, datasett). */
  | "aapen-feed"
  /** Ingen offentlig programmatisk tilgang finnes. Kilden kan ikke brukes. */
  | "ingen-vei";

export interface Kilde {
  readonly navn: string;
  readonly tilgang: Tilgangsform;
  /** Basis-URL for API-et, eller null når `tilgang` er "ingen-vei". */
  readonly base: string | null;
  /** Hvordan vi autentiserer. Nøkler leses fra miljø, aldri fra kode. */
  readonly autentisering: "oauth2-client-credentials" | "oauth2-bearer" | "ingen" | null;
  /** Miljøvariabler som må være satt før kilden kan brukes. */
  readonly kreverEnv: readonly string[];
  /** Publisert kvote, slik vi dimensjonerer ratebudsjettet. */
  readonly kvote: { readonly kall: number; readonly periodeMs: number } | null;
  /** Hva kilden koster oss. `0` betyr gratis innenfor kvoten. */
  readonly kostnadUsdPerMnd: number | null;
  /**
   * Hvor lenge svar kan mellomlagres. Mange vilkår setter en øvre grense for
   * lagring av tredjepartsdata; caching er også den viktigste enkeltfaktoren
   * for å holde seg innenfor kvoten.
   */
  readonly cacheTakMs: number;
  readonly merknad: string;
}

const TIME = 60 * 60 * 1000;
const DAG = 24 * TIME;

export const KILDER: Readonly<Record<string, Kilde>> = Object.freeze({
  ebay: {
    navn: "eBay Browse API",
    tilgang: "lisensiert-api",
    base: "https://api.ebay.com/buy/browse/v1",
    autentisering: "oauth2-client-credentials",
    kreverEnv: ["EBAY_CLIENT_ID", "EBAY_CLIENT_SECRET"],
    // Produksjonskvoten tildeles per applikasjon og oppgis i utviklerkontoen.
    // Verdien her er et konservativt utgangspunkt; les faktisk kvote fra
    // Developer Analytics API og overstyr før drift.
    kvote: { kall: 5_000, periodeMs: DAG },
    kostnadUsdPerMnd: 0,
    cacheTakMs: 6 * TIME,
    merknad:
      "Dekker søk og tilbudsdata. Krever registrert applikasjon. " +
      "Feed API gir bulk-nedlasting og er billigere per rad enn Browse " +
      "hvis kataloganalyse er målet.",
  },

  x: {
    navn: "X API v2",
    tilgang: "lisensiert-api",
    base: "https://api.x.com/2",
    autentisering: "oauth2-bearer",
    kreverEnv: ["X_BEARER_TOKEN"],
    // Nivåene endres ofte. Sett kvoten fra det nivået du faktisk abonnerer på;
    // gratisnivået er i praksis for lite til kontinuerlig signalinnhenting.
    kvote: { kall: 15_000, periodeMs: 30 * DAG },
    kostnadUsdPerMnd: 200,
    cacheTakMs: 15 * 60_000,
    merknad:
      "Gratisnivået holder ikke til en driftsløkke — det er nivået under " +
      "Basic som gjør dette til en linje i budsjettet, ikke et teknisk problem. " +
      "Verifiser nivå, pris og kvote mot gjeldende utviklerportal før drift; " +
      "de har endret seg flere ganger.",
  },

  temu: {
    navn: "Temu",
    tilgang: "ingen-vei",
    base: null,
    autentisering: null,
    kreverEnv: [],
    kvote: null,
    kostnadUsdPerMnd: null,
    cacheTakMs: 0,
    merknad:
      "Ingen offentlig produktdata-API. Den eneste programmatiske veien er " +
      "affiliate-/partnerprogrammet, som gir lenker og kampanjedata — ikke " +
      "prisdata egnet til arbitrasje. Portneren nekter kall mot denne kilden. " +
      "Skal Temu inn i modellen, må det skje gjennom en partneravtale eller en " +
      "tredjepartsleverandør som selv har rettighetene; ellers må kilden ut av " +
      "arkitekturen.",
  },

  coingecko: {
    navn: "CoinGecko API",
    tilgang: "lisensiert-api",
    base: "https://api.coingecko.com/api/v3",
    autentisering: "ingen",
    kreverEnv: [],
    kvote: { kall: 30, periodeMs: 60_000 },
    kostnadUsdPerMnd: 0,
    cacheTakMs: 60_000,
    merknad:
      "Gratisnivået rekker til prisoppslag for Skattemesteren og Livvakten. " +
      "Ikke egnet som orakel for selve handelen — bruk kjedens egne reserver " +
      "til slippasje, og denne kun til USD-verdsetting av friksjon.",
  },
});

export class KildeAvvist extends Error {
  constructor(
    readonly kilde: string,
    readonly arsak: string,
  ) {
    super(`kilde «${kilde}» avvist: ${arsak}`);
    this.name = "KildeAvvist";
  }
}

/**
 * Hent en kilde som er klar til bruk, eller kast med årsak.
 *
 * Dette er porten som erstatter unnvikelse: en kilde uten lovlig vei kan ikke
 * hentes, uansett hva som kaller. Mangler nøkler, sier feilen hvilke.
 */
export function apneKilde(
  navn: string,
  env: Record<string, string | undefined> = process.env,
): Kilde {
  const kilde = KILDER[navn];
  if (!kilde) throw new KildeAvvist(navn, "ukjent kilde");

  if (kilde.tilgang === "ingen-vei") {
    throw new KildeAvvist(navn, `ingen lovlig programmatisk tilgang. ${kilde.merknad}`);
  }

  const mangler = kilde.kreverEnv.filter((n) => !env[n]);
  if (mangler.length > 0) {
    throw new KildeAvvist(navn, `mangler legitimasjon i miljøet: ${mangler.join(", ")}`);
  }

  return kilde;
}

/** Kilder som faktisk kan brukes med gjeldende miljø. */
export function tilgjengeligeKilder(
  env: Record<string, string | undefined> = process.env,
): readonly string[] {
  return Object.keys(KILDER).filter((navn) => {
    try {
      apneKilde(navn, env);
      return true;
    } catch {
      return false;
    }
  });
}
