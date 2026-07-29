/**
 * Eksekveringsruting: hold transaksjoner utenfor den offentlige mempoolen.
 *
 * Hva privat ruting faktisk gir deg, og hva den ikke gir:
 *
 *  GIR:  transaksjonen kringkastes ikke til den offentlige mempoolen, så
 *        generiske sandwich-bots ser den aldri. Den får revert-beskyttelse:
 *        feiler simuleringen, blir den ikke inkludert, og du betaler ikke gass
 *        for en tapt handel.
 *
 *  GIR IKKE: beskyttelse mot byggeren selv. Sender du til en bygger, ser
 *        byggeren innholdet. Tilliten flyttes fra «hele mempoolen» til «denne
 *        byggeren». Det er en enorm forbedring, men det er tillit, ikke
 *        kryptografi. Derfor er slippasjevinduet i mev.ts fortsatt den
 *        bindende garantien — privat ruting er andre forsvarslinje, ikke
 *        erstatning for den første.
 *
 * L2-nuansen: Arbitrum, Optimism og Base har i dag én sekvenserer med privat
 * innsending og først-til-mølla-rekkefølge. Det finnes ingen offentlig mempool
 * å bli sandwichet i, så «rute privat» er meningsløst der — men du stoler i
 * stedet på sekvensereren. Behandles eksplisitt under, slik at systemet ikke
 * later som det har beskyttelse det ikke trenger, eller mangler beskyttelse det
 * ikke kan få.
 */

import type { Kjede } from "../kjerne/typer.ts";

export type Beskyttelsesform =
  /** Egen privat innsendingsvei til byggere. Ethereum L1. */
  | "privat-bygger"
  /** Kjeden har ingen offentlig mempool; sekvensereren er den tillitte parten. */
  | "sekvenserer"
  /** Ingen beskyttelse tilgjengelig. Handelen skal ikke skje her. */
  | "ingen";

export interface PrivatEndepunkt {
  readonly navn: string;
  readonly url: string;
  /** Gir endepunktet revert-beskyttelse (utelatelse i stedet for tap)? */
  readonly revertBeskyttelse: boolean;
  /** Deler endepunktet tilbake MEV til avsender? Påvirker ikke sikkerhet. */
  readonly refunderer: boolean;
}

/**
 * Endepunkter for Ethereum L1. Rekkefølgen er prioritet: første som svarer
 * brukes. Alle tre er beskyttede innsendingsveier, ikke offentlige noder.
 */
export const L1_ENDEPUNKTER: readonly PrivatEndepunkt[] = Object.freeze([
  {
    navn: "flashbots-protect",
    url: "https://rpc.flashbots.net/fast",
    revertBeskyttelse: true,
    refunderer: true,
  },
  {
    navn: "mev-blocker",
    url: "https://rpc.mevblocker.io",
    revertBeskyttelse: true,
    refunderer: true,
  },
  {
    navn: "bloxroute-protect",
    url: "https://mev.api.blxrbdn.com",
    revertBeskyttelse: true,
    refunderer: false,
  },
]);

export function beskyttelseFor(kjede: Kjede): Beskyttelsesform {
  switch (kjede) {
    case "ethereum":
      return "privat-bygger";
    case "arbitrum":
    case "optimism":
    case "base":
      return "sekvenserer";
    case "polygon":
      // Polygon PoS har en offentlig mempool og ingen bredt tilgjengelig
      // beskyttet innsendingsvei på nivå med L1. Vi handler ikke her.
      return "ingen";
  }
}

/**
 * Forhåndssimulering. Injiseres slik at Livvakten kan testes uten nettverk, og
 * slik at endepunktet kan byttes uten å røre beslutningslogikken.
 */
export interface Simulator {
  /**
   * Kjør transaksjonen mot gjeldende tilstand. Skal reflektere `eth_call` eller
   * bundle-simulering mot samme blokk vi sikter på.
   */
  simuler(tx: RaTransaksjon): Promise<Simuleringsutfall>;
}

export interface RaTransaksjon {
  readonly til: string;
  readonly data: string;
  readonly verdiWei: bigint;
  readonly gassGrense: bigint;
  readonly kjede: Kjede;
  readonly fra: string;
}

export type Simuleringsutfall =
  | { readonly ok: true; readonly gassBrukt: bigint; readonly utBelop: bigint }
  | { readonly ok: false; readonly revertArsak: string };

export interface Innsender {
  send(tx: RaTransaksjon, endepunkt: PrivatEndepunkt): Promise<string>;
}

/** Velg endepunkt for en kjede, eller null om kjeden ikke skal handles på. */
export function velgEndepunkt(
  kjede: Kjede,
  tilgjengelige: readonly PrivatEndepunkt[] = L1_ENDEPUNKTER,
): PrivatEndepunkt | null {
  const form = beskyttelseFor(kjede);
  if (form === "ingen") return null;
  if (form === "sekvenserer") return null; // ordinær RPC; ingen privat vei å velge
  return tilgjengelige.find((e) => e.revertBeskyttelse) ?? null;
}
