/**
 * Heltallsmatematikk for kapital.
 *
 * Premiss: "hver brøkdel av en coin er kapital". Flyttall (IEEE-754 double) kan
 * ikke representere 0.1 eksakt, og akkumulert avrunding over tusenvis av
 * mikrohandler gir drift i din disfavør. Alt som representerer en saldo eller et
 * beløp er derfor `bigint` i minste enhet (wei, satoshi, cent), aldri `number`.
 *
 * Forholdstall (gebyrer, slippasje, toleranser) uttrykkes i basispunkter:
 * 1 bp = 0,01 %, 10 000 bp = 100 %.
 */

/** Basispunkter. 10 000 bp = 100 %. */
export const BPS: bigint = 10_000n;

/** Beløp i minste udelelige enhet av en eiendel. */
export type Grunnenhet = bigint;

/** USD i cent, som heltall. */
export type UsdCent = bigint;

export class PengeFeil extends Error {
  constructor(melding: string) {
    super(melding);
    this.name = "PengeFeil";
  }
}

/**
 * Multipliser med en brøkdel uttrykt i basispunkter, med gulvavrunding.
 * Gulv (ikke nærmeste) er valgt bevisst: når vi beregner hva vi *mottar*
 * runder vi ned, slik at et avvik alltid er i vår favør ved kontroll.
 */
export function andelBps(belop: bigint, bps: bigint): bigint {
  if (bps < 0n) throw new PengeFeil(`negative basispunkter: ${bps}`);
  return (belop * bps) / BPS;
}

/** Trekk fra en andel i basispunkter, f.eks. et gebyr på 30 bp. */
export function minusBps(belop: bigint, bps: bigint): bigint {
  if (bps > BPS) throw new PengeFeil(`andel over 100 %: ${bps} bp`);
  return andelBps(belop, BPS - bps);
}

/**
 * Andelen `del` utgjør av `helhet`, i basispunkter, avrundet opp.
 *
 * Oppover-avrunding er bevisst: dette brukes til å måle *kostnad* mot en
 * terskel, og en kostnad som rundes ned kan snike en operasjon gjennom porten.
 */
export function tilBps(del: bigint, helhet: bigint): bigint {
  if (helhet === 0n) throw new PengeFeil("kan ikke beregne andel av null");
  if (helhet < 0n) throw new PengeFeil(`negativ helhet: ${helhet}`);
  const teller = del * BPS;
  const opprundet = (teller + helhet - 1n) / helhet;
  return del < 0n ? -((-teller) / helhet) : opprundet;
}

/**
 * Skaler et beløp mellom enheter med ulikt antall desimaler.
 * Nødvendig når USDC (6 desimaler) møter WETH (18 desimaler).
 */
export function skaler(belop: bigint, fraDesimaler: number, tilDesimaler: number): bigint {
  if (!Number.isInteger(fraDesimaler) || !Number.isInteger(tilDesimaler)) {
    throw new PengeFeil("desimaler må være heltall");
  }
  if (fraDesimaler < 0 || tilDesimaler < 0) {
    throw new PengeFeil("desimaler kan ikke være negative");
  }
  const diff = tilDesimaler - fraDesimaler;
  if (diff === 0) return belop;
  if (diff > 0) return belop * 10n ** BigInt(diff);
  return belop / 10n ** BigInt(-diff);
}

/** Minste av to beløp. */
export function minste(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

/** Største av to beløp. */
export function storste(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

/** Summer beløp uten mellomliggende flyttallssteg. */
export function sum(belop: readonly bigint[]): bigint {
  return belop.reduce((a, b) => a + b, 0n);
}

/**
 * Formater en grunnenhet for logging. Kun for menneskelig lesing —
 * resultatet er en streng og skal aldri mates tilbake inn i beregninger.
 */
export function formater(belop: bigint, desimaler: number, symbol = ""): string {
  const negativ = belop < 0n;
  const absolutt = negativ ? -belop : belop;
  const skala = 10n ** BigInt(desimaler);
  const heltall = absolutt / skala;
  const brok = (absolutt % skala).toString().padStart(desimaler, "0");
  const kropp = desimaler === 0 ? `${heltall}` : `${heltall}.${brok}`;
  return `${negativ ? "-" : ""}${kropp}${symbol ? ` ${symbol}` : ""}`;
}
