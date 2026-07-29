/**
 * Integrasjonstester: hele kjeden 13 → 12 → 7, med hjerteslag og hvelvrotasjon.
 *
 * Poenget her er ikke å gjenta enhetstestene, men å vise at portene faktisk
 * stopper det de skal stoppe når de står sammen — og at et drap i en port
 * hindrer alt arbeid i de påfølgende.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import type { Basseng, BruttoMulighet, Eiendel } from "../src/kjerne/typer.ts";
import { Livvakt, STANDARD_LIVVAKT, type Handelsforslag } from "../src/agent12-livvakten/index.ts";
import type { Pris } from "../src/agent12-livvakten/mev.ts";
import type { RaTransaksjon, Simulator, Simuleringsutfall } from "../src/agent12-livvakten/ruting.ts";
import { Skattemester } from "../src/agent13-skattemester/index.ts";
import { ledd } from "../src/agent13-skattemester/gebyrer.ts";
import { Hjerteslag, type PulsLager } from "../src/orkestrator/hjerteslag.ts";
import { Hvelvrotasjon, STANDARD_ISOLASJON, type Hvelv } from "../src/orkestrator/lommebokisolasjon.ts";
import { Pipeline, type Eksekutor } from "../src/orkestrator/pipeline.ts";

const E18 = 10n ** 18n;
const WETH: Eiendel = { symbol: "WETH", adresse: "0x1", desimaler: 18, kjede: "ethereum" };
const USDC: Eiendel = { symbol: "USDC", adresse: "0x2", desimaler: 6, kjede: "ethereum" };
const USDC_PRIS: Pris = { centPerEnhet: 100n, desimaler: 6 };

class Testklokke {
  constructor(private tid = 1_000_000) {}
  na(): number {
    return this.tid;
  }
  gaa(ms: number): void {
    this.tid += ms;
  }
}

class MinnePuls implements PulsLager {
  private poster = new Map<string, string>();
  async skriv(n: string, v: string): Promise<void> {
    this.poster.set(n, v);
  }
  async les(n: string): Promise<string | null> {
    return this.poster.get(n) ?? null;
  }
}

function basseng(over: Partial<Basseng> = {}): Basseng {
  return {
    inn: WETH,
    ut: USDC,
    reserveInn: 100n * E18,
    reserveUt: 300_000_000_000n,
    gebyrBps: 30n,
    lestVed: 1_000_000,
    ...over,
  };
}

function tx(): Omit<RaTransaksjon, "kjede"> {
  return { til: "0xruter", data: "0x", verdiWei: 0n, gassGrense: 200_000n, fra: "0xhvelv" };
}

function forslag(inn: bigint, over: Partial<Handelsforslag> = {}): Handelsforslag {
  return {
    operasjonId: "op-1",
    inn,
    basseng: basseng(),
    utPris: USDC_PRIS,
    bruttoUsd: 50_000n,
    tx: tx(),
    ...over,
  };
}

/** Simulator som svarer med det bassenget faktisk ville gitt. */
function godSimulator(utBelop: bigint): Simulator {
  return {
    async simuler(): Promise<Simuleringsutfall> {
      return { ok: true, gassBrukt: 180_000n, utBelop };
    },
  };
}

function mulighet(over: Partial<BruttoMulighet> = {}): BruttoMulighet {
  return {
    id: "op-1",
    kjede: "ethereum",
    bruttoUsd: 200_000n,
    innsatsUsd: 400_000n,
    levetidMs: 30_000,
    kilde: "test",
    ...over,
  };
}

function hvelv(id: string, tildeltCent: bigint): Hvelv {
  return {
    id,
    adresse: `0x${id}`,
    signererHandtak: `kms://${id}`,
    tildeltCent,
    handler: 0,
    status: "aktiv",
  };
}

// ------------------------------------------------------------------- Livvakten

test("Livvakten godkjenner en trygg handel og velger en privat rute", async () => {
  const k = new Testklokke();
  const f = forslag(E18 / 64n);
  const lv = new Livvakt(godSimulator(10n ** 12n), STANDARD_LIVVAKT, undefined, k);
  const dom = await lv.vurder(f);

  assert.equal(dom.dom.utfall, "godkjent", dom.dom.forklaring);
  assert.equal(dom.beskyttelse, "privat-bygger");
  assert.equal(dom.endepunkt?.navn, "flashbots-protect");
  assert.equal(dom.endepunkt?.revertBeskyttelse, true);
});

test("Livvakten dreper handelen når reservene er foreldede", async () => {
  const k = new Testklokke();
  const f = forslag(E18 / 64n, { basseng: basseng({ lestVed: k.na() - 60_000 }) });
  const lv = new Livvakt(godSimulator(10n ** 12n), STANDARD_LIVVAKT, undefined, k);
  const dom = await lv.vurder(f);

  assert.equal(dom.dom.utfall, "drept");
  assert.equal(dom.dom.arsak, "foreldede-reserver");
});

test("Livvakten nekter å handle på en kjede uten beskyttelsesform", async () => {
  const k = new Testklokke();
  const polygon: Eiendel = { ...WETH, kjede: "polygon" };
  const f = forslag(E18 / 64n, { basseng: basseng({ inn: polygon }) });
  const lv = new Livvakt(godSimulator(10n ** 12n), STANDARD_LIVVAKT, undefined, k);
  const dom = await lv.vurder(f);

  assert.equal(dom.dom.utfall, "drept");
  assert.equal(dom.dom.arsak, "ingen-mev-beskyttelse");
});

test("Livvakten dreper når vinduet kan spise fortjenesten, selv bak privat rute", async () => {
  const k = new Testklokke();
  // Liten bruttofortjeneste mot en stor handel: vinduet blir for stort relativt
  // til hva operasjonen er verdt, og da hjelper ikke privat ruting.
  const f = forslag(5n * E18, { bruttoUsd: 100n });
  const lv = new Livvakt(
    godSimulator(10n ** 12n),
    { ...STANDARD_LIVVAKT, tillatKrymping: false },
    undefined,
    k,
  );
  const dom = await lv.vurder(f);

  assert.equal(dom.dom.utfall, "drept");
  assert.equal(dom.dom.arsak, "vindu-for-stort-mot-brutto");
});

test("Livvakten dreper når simuleringen reverterer", async () => {
  const k = new Testklokke();
  const simulator: Simulator = {
    async simuler() {
      return { ok: false, revertArsak: "INSUFFICIENT_OUTPUT_AMOUNT" };
    },
  };
  const lv = new Livvakt(simulator, STANDARD_LIVVAKT, undefined, k);
  const dom = await lv.vurder(forslag(E18 / 64n));

  assert.equal(dom.dom.utfall, "drept");
  assert.equal(dom.dom.arsak, "simulering-reverterte");
  assert.match(dom.dom.forklaring, /INSUFFICIENT_OUTPUT_AMOUNT/);
});

test("Livvakten dreper når simulert utbeløp ligger under minUt", async () => {
  const k = new Testklokke();
  // Simulatoren rapporterer et latterlig lavt utbeløp.
  const lv = new Livvakt(godSimulator(1n), STANDARD_LIVVAKT, undefined, k);
  const dom = await lv.vurder(forslag(E18 / 64n));

  assert.equal(dom.dom.utfall, "drept");
  assert.equal(dom.dom.arsak, "simulert-under-minut");
});

test("Livvakten strammer toleransen framfor å krympe når det er nok", async () => {
  const k = new Testklokke();
  const lv = new Livvakt(
    godSimulator(10n ** 12n),
    { ...STANDARD_LIVVAKT, onsketToleranseBps: 500n },
    undefined,
    k,
  );
  const dom = await lv.vurder(forslag(E18 / 16n));

  assert.equal(dom.dom.utfall, "godkjent", dom.dom.forklaring);
  assert.equal(dom.inn, E18 / 16n, "handelsstørrelsen skal være urørt");
  assert.ok(dom.slippasje!.toleranseBps < 500n, "toleransen skal ha blitt strammet");
});

// --------------------------------------------------------------------- Pipeline

function byggPipeline(over: {
  simulator?: Simulator;
  hvelvSaldo?: bigint;
  eksekutor?: Eksekutor;
} = {}) {
  const k = new Testklokke();
  const utfort: string[] = [];
  const eksekutor: Eksekutor =
    over.eksekutor ??
    {
      async utfor() {
        utfort.push("sendt");
        return { hash: "0xdeadbeef" };
      },
    };

  const hs = new Hjerteslag(
    new MinnePuls(),
    { nokkel: "p", intervallMs: 1_000, stillstandsgrenseMs: 10_000, pulsTtlMs: 5_000 },
    k,
  );

  const pipeline = new Pipeline({
    skattemester: new Skattemester(),
    livvakt: new Livvakt(over.simulator ?? godSimulator(10n ** 12n), STANDARD_LIVVAKT, undefined, k),
    eksekutor,
    rotasjon: new Hvelvrotasjon(
      [hvelv("a", over.hvelvSaldo ?? 1_000_000n), hvelv("b", over.hvelvSaldo ?? 1_000_000n)],
      STANDARD_ISOLASJON,
    ),
    hjerteslag: hs,
    isolasjon: STANDARD_ISOLASJON,
  });

  return { pipeline, klokke: k, hjerteslag: hs, utfort };
}

test("en god operasjon går gjennom hele kjeden og utføres", async () => {
  const { pipeline, utfort } = byggPipeline();
  const utfall = await pipeline.kjor(
    mulighet(),
    [ledd("gass", 300n, "anslag")],
    (inn) => forslag(inn),
    E18 / 64n,
  );

  assert.equal(utfall.dom.utfall, "godkjent", utfall.dom.forklaring);
  assert.equal(utfall.hash, "0xdeadbeef");
  assert.equal(utfall.hvelv, "a");
  assert.deepEqual(utfort, ["sendt"]);
});

test("et drap i friksjonsporten hindrer at Livvakten og Eksekutøren kjører i det hele tatt", async () => {
  const { pipeline, utfort } = byggPipeline();
  const utfall = await pipeline.kjor(
    mulighet({ bruttoUsd: 1_000n }), // 10 USD brutto mot 30 USD friksjon
    [ledd("gass", 3_000n, "kjent")],
    (inn) => forslag(inn),
    E18 / 64n,
  );

  assert.equal(utfall.dom.utfall, "drept");
  assert.equal(utfall.ruting, null, "Livvakten skal aldri ha blitt spurt");
  assert.deepEqual(utfort, [], "ingenting skal ha blitt sendt");
  assert.ok(utfall.friksjon !== null, "men friksjonsregnskapet skal foreligge");
});

test("hvelvet roteres etter en utført handel", async () => {
  const { pipeline } = byggPipeline();
  const args = [mulighet(), [ledd("gass", 300n, "anslag")], (inn: bigint) => forslag(inn), E18 / 64n] as const;

  const forste = await pipeline.kjor(...args);
  assert.equal(forste.hvelv, "a");

  const andre = await pipeline.kjor(...args);
  assert.equal(andre.hvelv, "b", "andre handel skal bruke neste branncelle");

  // Begge brannceller er nå pensjonert.
  const tredje = await pipeline.kjor(...args);
  assert.equal(tredje.dom.utfall, "drept");
  assert.equal(tredje.dom.arsak, "ingen-hvelv-tilgjengelig");
});

test("en operasjon som overstiger hvelvets eksponeringstak dør før eksekvering", async () => {
  // Hvelv på 5 000 USD, tak på 50 % = 2 500 USD. Innsatsen er 4 000 USD.
  const { pipeline, utfort } = byggPipeline({ hvelvSaldo: 500_000n });
  const utfall = await pipeline.kjor(
    mulighet({ innsatsUsd: 400_000n }),
    [ledd("gass", 300n, "anslag")],
    (inn) => forslag(inn),
    E18 / 64n,
  );

  assert.equal(utfall.dom.utfall, "drept");
  assert.equal(utfall.dom.arsak, "ingen-hvelv-tilgjengelig");
  assert.deepEqual(utfort, []);
  // Forklaringen skal skille «for tynt fragmentert» fra «rotasjonen er oppbrukt»,
  // fordi tiltakene er helt ulike.
  assert.match(utfall.dom.forklaring, /2 for små/);
  assert.match(utfall.dom.forklaring, /fragmentert for tynt/);
});

test("et hengende eksekveringskall blir en avvist operasjon, ikke en frossen løkke", async () => {
  const hengende: Eksekutor = { utfor: () => new Promise(() => {}) };
  const { pipeline, hjerteslag } = byggPipeline({ eksekutor: hengende });

  const utfall = await pipeline.kjor(
    mulighet(),
    [ledd("gass", 300n, "anslag")],
    (inn) => forslag(inn),
    E18 / 64n,
  );

  assert.equal(utfall.dom.utfall, "drept");
  assert.equal(utfall.dom.arsak, "frist-overskredet");
  // Eksekveringssteget registrerte ingen fremgang.
  assert.notEqual(hjerteslag.bilde().sisteSteg, "eksekvering");
});

test("en uventet feil i Eksekutøren dreper operasjonen uten å velte løkken", async () => {
  const sprengende: Eksekutor = {
    async utfor() {
      throw new Error("nonce too low");
    },
  };
  const { pipeline } = byggPipeline({ eksekutor: sprengende });

  const utfall = await pipeline.kjor(
    mulighet(),
    [ledd("gass", 300n, "anslag")],
    (inn) => forslag(inn),
    E18 / 64n,
  );

  assert.equal(utfall.dom.utfall, "drept");
  assert.equal(utfall.dom.arsak, "uventet-feil");
  assert.match(utfall.dom.forklaring, /nonce too low/);
});

test("de porterte stegene registrerer fremgang, slik at pulsen holdes levende", async () => {
  const { pipeline, hjerteslag } = byggPipeline();
  const foer = hjerteslag.bilde().sekvens;

  await pipeline.kjor(mulighet(), [ledd("gass", 300n, "anslag")], (inn) => forslag(inn), E18 / 64n);

  // Tre porterte steg: friksjon, ruting, eksekvering.
  assert.equal(hjerteslag.bilde().sekvens, foer + 3);
  assert.equal(hjerteslag.bilde().sisteSteg, "eksekvering");
  assert.equal(hjerteslag.bilde().friskt, true);
});
