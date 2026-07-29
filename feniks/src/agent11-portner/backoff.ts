/**
 * Retry-strategi.
 *
 * Tre regler som avgjør om en integrasjon overlever eller blir sperret:
 *
 *  1. `Retry-After` overstyrer alltid vår egen beregning. Sier kilden 60
 *     sekunder, venter vi 60 sekunder. Å prøve igjen tidligere er den enkleste
 *     måten å konvertere en midlertidig struping til en varig sperre.
 *
 *  2. Full jitter, ikke fast eksponentiell. Uten jitter kommer alle retries
 *     tilbake samtidig, og en synkronisert bølge fra samme klient er både
 *     ineffektiv og et tydelig bot-signal.
 *
 *  3. 4xx som ikke er 429 gjentas aldri. En 403 betyr at forespørselen er feil
 *     eller uautorisert; å gjenta den er ren skade. Bare 429, 408 og 5xx er
 *     forbigående.
 */

export type Retrybarhet = "gjenta" | "gi-opp";

export interface Svarstatus {
  readonly kode: number;
  /** `Retry-After`, i sekunder, hvis kilden sendte den. */
  readonly retryAfterSek?: number | undefined;
}

export function retrybar(status: Svarstatus): Retrybarhet {
  if (status.kode === 429 || status.kode === 408) return "gjenta";
  if (status.kode >= 500 && status.kode <= 599) return "gjenta";
  return "gi-opp";
}

export interface BackoffValg {
  readonly forsteMs: number;
  readonly takMs: number;
  readonly maksForsok: number;
  /** Kilde for tilfeldighet, injisert for testbarhet. */
  readonly tilfeldig?: () => number;
}

export const STANDARD_BACKOFF: BackoffValg = Object.freeze({
  forsteMs: 500,
  takMs: 60_000,
  maksForsok: 5,
});

/**
 * Ventetid før forsøk nummer `forsok` (1-indeksert).
 * Full jitter: uniform i [0, eksponentielt tak].
 */
export function ventetidMs(
  forsok: number,
  status: Svarstatus,
  valg: BackoffValg = STANDARD_BACKOFF,
): number {
  if (status.retryAfterSek !== undefined && status.retryAfterSek >= 0) {
    return Math.min(status.retryAfterSek * 1000, valg.takMs);
  }
  const tilfeldig = valg.tilfeldig ?? Math.random;
  const tak = Math.min(valg.takMs, valg.forsteMs * 2 ** Math.max(0, forsok - 1));
  return Math.floor(tilfeldig() * tak);
}

export interface Forsoksplan {
  readonly forsok: number;
  readonly ventMs: number;
}

/**
 * Hele retry-planen for et feilende kall, eller `null` når det ikke skal
 * gjentas. Å bygge planen som en verdi gjør den testbar uten å faktisk vente.
 */
export function planlegg(
  status: Svarstatus,
  brukteForsok: number,
  valg: BackoffValg = STANDARD_BACKOFF,
): Forsoksplan | null {
  if (retrybar(status) === "gi-opp") return null;
  if (brukteForsok >= valg.maksForsok) return null;
  const neste = brukteForsok + 1;
  return { forsok: neste, ventMs: ventetidMs(neste, status, valg) };
}
