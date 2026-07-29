import { test } from "node:test";
import assert from "node:assert/strict";
import { PengeFeil } from "../src/kjerne/penger.ts";
import type { BruttoMulighet } from "../src/kjerne/typer.ts";
import {
  Skattemester,
  STANDARD_SKATTEMESTER,
  kapitalbinding,
  minimumLonnsomBrutto,
} from "../src/agent13-skattemester/index.ts";
import { baseFeeTak, beregnGass, type GassTilstand, type NativPris } from "../src/agent13-skattemester/gass.ts";
import { SATSER, bereg, ledd, sats, summerFriksjon } from "../src/agent13-skattemester/gebyrer.ts";

const GWEI = 1_000_000_000n;
/** ETH til 3 000 USD. */
const ETH_PRIS: NativPris = { centPerEnhet: 300_000n, desimaler: 18 };

function mulighet(over: Partial<BruttoMulighet> = {}): BruttoMulighet {
  return {
    id: "op-1",
    kjede: "ethereum",
    bruttoUsd: 10_000n, // 100 USD
    innsatsUsd: 500_000n, // 5 000 USD
    levetidMs: 60_000,
    kilde: "test",
    ...over,
  };
}

test("baseFeeTak sammensetter 12,5 prosent per blokk eksakt", () => {
  // 9/8 per blokk, i heltall.
  assert.equal(baseFeeTak(1_000_000n, 0), 1_000_000n);
  assert.equal(baseFeeTak(1_000_000n, 1), 1_125_000n);
  assert.equal(baseFeeTak(1_000_000n, 2), 1_265_625n);
  // Over 8 blokker: 9^8/8^8 ≈ 2,566
  assert.equal(baseFeeTak(1_000_000_000n, 8), (1_000_000_000n * 9n ** 8n) / 8n ** 8n);
});

test("baseFeeTak avviser urimelige horisonter", () => {
  assert.throws(() => baseFeeTak(1n, -1), PengeFeil);
  assert.throws(() => baseFeeTak(1n, 65), PengeFeil);
});

test("gassbudsjettet skiller forventet fra tak, og taket er strengt større", () => {
  const tilstand: GassTilstand = {
    kjede: "ethereum",
    baseFeeWei: 20n * GWEI,
    prioritetWei: GWEI,
    lestVed: 0,
  };
  const b = beregnGass(200_000n, tilstand, ETH_PRIS);

  assert.ok(b.maksWei > b.forventetWei, "taket må ligge over anslaget");
  assert.equal(b.maxFeePerGas, baseFeeTak(20n * GWEI, 4) + GWEI);
  assert.equal(b.maxPriorityFeePerGas, GWEI);
  // 200k gass til ~21 gwei er ~0,0042 ETH ≈ 12,60 USD forventet.
  assert.equal(b.forventetUsd, 1_260n);
  assert.ok(b.maksUsd > b.forventetUsd);
});

test("L2 uten L1-datagebyr avvises framfor å underestimere kostnaden", () => {
  const uten: GassTilstand = {
    kjede: "base",
    baseFeeWei: 1_000_000n,
    prioritetWei: 100_000n,
    lestVed: 0,
  };
  assert.throws(() => beregnGass(200_000n, uten, ETH_PRIS), PengeFeil);

  const med: GassTilstand = { ...uten, l1DataFeeWei: 5_000_000_000_000n };
  const b = beregnGass(200_000n, med, ETH_PRIS);
  assert.ok(b.l1DataDelWei > 0n, "L1-delen skal være med i totalen");
  assert.ok(b.maksWei > b.l1DataDelWei);
});

test("L1-datadelen dominerer ofte L2-totalen", () => {
  // Dette er hele grunnen til at l1DataFeeWei er påkrevd: utførelsen på L2 er
  // nesten gratis, publiseringen på L1 er ikke.
  const tilstand: GassTilstand = {
    kjede: "arbitrum",
    baseFeeWei: 10_000_000n, // 0,01 gwei
    prioritetWei: 0n,
    l1DataFeeWei: 3_000_000_000_000_000n,
    lestVed: 0,
  };
  const b = beregnGass(500_000n, tilstand, ETH_PRIS);
  const utforelse = b.maksWei - b.l1DataDelWei;
  assert.ok(
    b.l1DataDelWei > utforelse * 10n,
    `L1-delen ${b.l1DataDelWei} skal dominere utførelsen ${utforelse}`,
  );
});

test("gebyrsatser respekterer minstegebyr og faste ledd", () => {
  assert.equal(bereg(100_000n, SATSER.dexBasseng), 300n); // 30 bp av 1000 USD
  assert.equal(bereg(100_000n, SATSER.cexUttak), 150n); // rent fast ledd
  // Minstegebyr slår inn når volumet er lite.
  assert.equal(bereg(100n, sats(10n, 0n, 50n)), 50n);
});

test("summerFriksjon skiller kjente kostnader fra anslag", () => {
  const r = summerFriksjon([
    ledd("gass", 300n, "anslag"),
    ledd("dex", 100n, "kjent"),
    ledd("frakt", 100n, "anslag"),
  ]);
  assert.equal(r.totaltCent, 500n);
  // 400 av 500 er anslag = 8000 bp
  assert.equal(r.anslagsandelBps, 8_000n);
});

test("minimumLonnsomBrutto er inversjonen av femprosentregelen — altså 20x", () => {
  assert.equal(minimumLonnsomBrutto(300n, 500n), 6_000n);
  assert.equal(minimumLonnsomBrutto(100n, 500n), 2_000n);
  // Med et 10 %-tak blir det 10x i stedet.
  assert.equal(minimumLonnsomBrutto(300n, 1_000n), 3_000n);
});

test("kapitalbinding priser tid, ikke bare beløp", () => {
  const time = 60 * 60 * 1000;
  // 10 % årlig på 100 000 cent i én time.
  const en = kapitalbinding(100_000n, time, 1_000n);
  const to = kapitalbinding(100_000n, 2 * time, 1_000n);
  assert.ok(en > 0n);
  assert.equal(to, en * 2n);
  assert.equal(kapitalbinding(100_000n, 0, 1_000n), 0n);
});

test("porten slipper gjennom en operasjon med god margin", () => {
  const sm = new Skattemester();
  const dom = sm.vurder(mulighet({ bruttoUsd: 50_000n }), [ledd("gass", 300n, "anslag")]);
  assert.equal(dom.dom.utfall, "godkjent");
  assert.ok(dom.nettoCent > 0n);
  assert.ok(dom.friksjonsandelBps <= STANDARD_SKATTEMESTER.maksFriksjonBps);
});

test("porten dreper når friksjonen overstiger fem prosent", () => {
  const sm = new Skattemester();
  // 100 USD brutto, 10 USD friksjon = 1000 bp, over taket på 500.
  const dom = sm.vurder(mulighet({ bruttoUsd: 10_000n }), [ledd("gass", 1_000n, "kjent")]);
  assert.equal(dom.dom.utfall, "drept");
  assert.equal(dom.dom.arsak, "friksjon-over-tak");
  // Forklaringen skal inneholde hva som hadde vært nødvendig.
  assert.match(dom.dom.forklaring, /minst \d+ cent brutto/);
});

test("drapsforklaringen oppgir 20x-kravet eksplisitt", () => {
  const sm = new Skattemester();
  const dom = sm.vurder(mulighet({ bruttoUsd: 10_000n }), [ledd("gass", 1_000n, "kjent")]);
  assert.match(dom.dom.forklaring, /20x friksjonen/);
});

test("porten dreper når netto er negativ selv om forholdstallet ser greit ut", () => {
  const sm = new Skattemester();
  const dom = sm.vurder(mulighet({ bruttoUsd: 100n }), [ledd("gass", 500n, "kjent")]);
  assert.equal(dom.dom.utfall, "drept");
  assert.equal(dom.dom.arsak, "negativ-netto");
});

test("anslåtte ledd får påslag, kjente ledd får ikke", () => {
  const sm = new Skattemester();
  const somAnslag = sm.vurder(mulighet(), [ledd("gass", 400n, "anslag")]);
  const somKjent = sm.vurder(mulighet(), [ledd("gass", 400n, "kjent")]);
  assert.ok(
    somAnslag.friksjonMedPaaslagCent > somKjent.friksjonMedPaaslagCent,
    "et anslag skal budsjetteres dyrere enn en kjent kostnad",
  );
});

test("kapitalbindingen legges til uten at kalleren kan glemme den", () => {
  const sm = new Skattemester();
  const dom = sm.vurder(mulighet({ levetidMs: 30 * 60_000 }), []);
  assert.ok(
    dom.regnskap.ledd.some((l) => l.navn === "kapitalbinding"),
    "kapitalbinding skal alltid være med i regnskapet",
  );
});

test("en mulighet uten bruttofortjeneste dør umiddelbart", () => {
  const sm = new Skattemester();
  const dom = sm.vurder(mulighet({ bruttoUsd: 0n }), []);
  assert.equal(dom.dom.utfall, "drept");
  assert.equal(dom.dom.arsak, "ingen-brutto");
});

test("mikromargin på L1 dør på gass alene — tallet modellen må tåle", () => {
  const sm = new Skattemester();
  const tilstand: GassTilstand = {
    kjede: "ethereum",
    baseFeeWei: 20n * GWEI,
    prioritetWei: GWEI,
    lestVed: 0,
  };
  // To handler (inn og ut) på en typisk swap-gassgrense.
  const gass = beregnGass(200_000n, tilstand, ETH_PRIS);
  const friksjon = gass.maksUsd * 2n;

  // En 1 %-margin på 5 000 USD innsats er 50 USD brutto.
  const dom = sm.vurder(mulighet({ bruttoUsd: 5_000n }), [ledd("gass", friksjon, "anslag")]);
  assert.equal(dom.dom.utfall, "drept");
  // Og den forteller hvor stor operasjonen måtte vært.
  assert.ok(
    dom.minimumBruttoCent > 50_000n,
    `krevd brutto ${dom.minimumBruttoCent} cent skal overstige 500 USD`,
  );
});
