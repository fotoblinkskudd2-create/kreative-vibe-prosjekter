import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MIN_BRUKBAR_TOLERANSE_BPS,
  STANDARD_ANGRIPER,
  krympTilToleranse,
  planleggTrygtVindu,
  simulerSandwich,
  verdiUsd,
  vurderMev,
  type Pris,
} from "../src/agent12-livvakten/mev.ts";
import { beregnSlippasje } from "../src/agent12-livvakten/slippasje.ts";
import type { Basseng, Eiendel } from "../src/kjerne/typer.ts";

const WETH: Eiendel = { symbol: "WETH", adresse: "0x1", desimaler: 18, kjede: "ethereum" };
const USDC: Eiendel = { symbol: "USDC", adresse: "0x2", desimaler: 6, kjede: "ethereum" };
const E18 = 10n ** 18n;

/** USDC til 1,00 USD, seks desimaler. */
const USDC_PRIS: Pris = { centPerEnhet: 100n, desimaler: 6 };
/** WETH til 3 000 USD, atten desimaler. Konsistent med bassengene under. */
const WETH_PRIS: Pris = { centPerEnhet: 300_000n, desimaler: 18 };

function basseng(reserveInn: bigint, reserveUt: bigint): Basseng {
  return { inn: WETH, ut: USDC, reserveInn, reserveUt, gebyrBps: 30n, lestVed: 1_000 };
}

test("verdiUsd omregner grunnenheter til cent", () => {
  assert.equal(verdiUsd(1_000_000n, USDC_PRIS), 100n); // 1 USDC = 100 cent
  assert.equal(verdiUsd(2_500_000n, USDC_PRIS), 250n);
});

test("offerets tap er alltid begrenset av slippasjevinduet", () => {
  // Dette er den bindende garantien. Angriperen kan ikke skyve prisen forbi
  // minUt, for da reverterer offerets handel og angrepet gir null.
  const b = basseng(100n * E18, 300_000_000_000n); // 100 WETH / 300k USDC
  const inn = 5n * E18;

  for (const toleranse of [10n, 50n, 100n, 300n, 1_000n]) {
    const s = beregnSlippasje(inn, b, toleranse);
    const vindu = s.forventetUt - s.minUt;
    const angrep = simulerSandwich(inn, b, s.minUt);

    assert.ok(
      angrep.offerFikkUt >= s.minUt,
      `toleranse ${toleranse} bp: offeret fikk ${angrep.offerFikkUt}, under minUt ${s.minUt}`,
    );
    assert.ok(
      angrep.offerTapUt <= vindu,
      `toleranse ${toleranse} bp: tap ${angrep.offerTapUt} overstiger vinduet ${vindu}`,
    );
  }
});

test("angriperens inntekt overstiger vårt tap — vinduet begrenser tapet, ikke angrepet", () => {
  // Bassenget er priset konsistent med de eksterne prisene under
  // (300 000 USDC / 100 WETH = 3 000 USD per WETH), slik at begge sider kan
  // måles i samme numerær uten omregningsfeil.
  const b = basseng(100n * E18, 300_000_000_000n);
  const inn = 5n * E18;
  const s = beregnSlippasje(inn, b, 300n); // romslig 3 % for å gi angrepet rom
  const angrep = simulerSandwich(inn, b, s.minUt);

  assert.ok(angrep.frontRunInn > 0n, "et 3 %-vindu skal være angripbart i det hele tatt");

  const tapCent = verdiUsd(angrep.offerTapUt, USDC_PRIS);
  const angriperCent = verdiUsd(angrep.angriperBruttoInn, WETH_PRIS);

  // Dette er den kontraintuitive delen, og grunnen til at `marginBps` finnes:
  // angriperen henter også bassengets skjevhet, altså LP-verdi. Inntekten er
  // derfor større enn vårt tap, og en port som antok likhet ville vært for slapp.
  assert.ok(
    angriperCent > tapCent,
    `angriperens inntekt ${angriperCent}c skal overstige vårt tap ${tapCent}c`,
  );
  // Men differansen er moderat — angriperen kan ikke hente et multiplum.
  assert.ok(
    angriperCent < tapCent * 2n,
    `inntekt ${angriperCent}c skal ligge under det dobbelte av tapet ${tapCent}c`,
  );
});

test("et stramt vindu gjør sandwichen ulønnsom å utføre", () => {
  const b = basseng(100n * E18, 300_000_000_000n);
  const inn = 5n * E18;
  // 1 bp vindu på en ~15 000 USD handel er rundt 1,50 USD — under gasskostnaden.
  const s = beregnSlippasje(inn, b, 1n);
  const v = vurderMev(s, USDC_PRIS, STANDARD_ANGRIPER);

  assert.ok(v.vinduUsd < v.angriperTerskelUsd, `${v.vinduUsd} skal være under ${v.angriperTerskelUsd}`);
  assert.equal(v.trygtOffentlig, true);
});

test("et romslig vindu er lønnsomt å angripe og flagges som utrygt", () => {
  const b = basseng(100n * E18, 300_000_000_000n);
  const s = beregnSlippasje(5n * E18, b, 300n); // 3 %
  const v = vurderMev(s, USDC_PRIS, STANDARD_ANGRIPER);

  assert.equal(v.trygtOffentlig, false);
  assert.ok(v.vinduUsd > v.angriperTerskelUsd);
});

test("maksTryggToleranse er den største toleransen som faktisk er trygg", () => {
  const b = basseng(100n * E18, 300_000_000_000n);
  const inn = 5n * E18;
  const v = vurderMev(beregnSlippasje(inn, b, 300n), USDC_PRIS, STANDARD_ANGRIPER);

  // Grensen skal være trygg …
  const pa = vurderMev(beregnSlippasje(inn, b, v.maksTryggToleranseBps), USDC_PRIS);
  assert.equal(pa.trygtOffentlig, true, `${v.maksTryggToleranseBps} bp skulle vært trygt`);

  // … og et hakk over skal ikke være det. Ellers er grensen ikke stram.
  const over = vurderMev(
    beregnSlippasje(inn, b, v.maksTryggToleranseBps + 2n),
    USDC_PRIS,
  );
  assert.equal(over.trygtOffentlig, false, "grensen skal være stram, ikke konservativ");
});

test("planleggTrygtVindu lar en allerede trygg handel stå urørt", () => {
  const b = basseng(100n * E18, 300_000_000_000n);
  const plan = planleggTrygtVindu(E18 / 64n, b, 50n, USDC_PRIS, beregnSlippasje);
  assert.deepEqual(plan.tiltak, ["uendret"]);
  assert.equal(plan.mev.trygtOffentlig, true);
  assert.equal(plan.inn, E18 / 64n);
  assert.equal(plan.toleranseBps, 50n);
});

test("planleggTrygtVindu strammer toleransen før den rører handelsstørrelsen", () => {
  const b = basseng(100n * E18, 300_000_000_000n);
  // 0,0625 WETH har maksTrygg ≈ 107 bp: 200 bp ønsket er utrygt, men det finnes
  // en brukbar strammere toleranse, så handelen skal ikke krympes.
  const plan = planleggTrygtVindu(E18 / 16n, b, 200n, USDC_PRIS, beregnSlippasje);

  assert.ok(plan.tiltak.includes("strammet-toleranse"));
  assert.ok(!plan.tiltak.includes("krympet-handel"), "handelen skulle ikke trenge krymping");
  assert.equal(plan.inn, E18 / 16n, "handelsstørrelsen skal være uendret");
  assert.ok(plan.toleranseBps < 200n);
  assert.equal(plan.mev.trygtOffentlig, true);
});

test("planleggTrygtVindu krymper handelen når selv strammeste brukbare toleranse er utrygg", () => {
  const b = basseng(100n * E18, 300_000_000_000n);
  // 5 WETH har maksTrygg = 1 bp, altså under MIN_BRUKBAR_TOLERANSE_BPS.
  // Toleransejustering hjelper ikke; handelen må bli mindre.
  const plan = planleggTrygtVindu(5n * E18, b, 50n, USDC_PRIS, beregnSlippasje);

  assert.ok(plan.tiltak.includes("krympet-handel"), `tiltak var ${plan.tiltak}`);
  assert.ok(plan.inn < 5n * E18, "handelen skal ha blitt mindre");
  assert.ok(
    plan.toleranseBps >= MIN_BRUKBAR_TOLERANSE_BPS,
    "resultatet skal ha en utførbar toleranse, ikke 0 bp",
  );
  assert.equal(plan.mev.trygtOffentlig, true);
});

test("planleggTrygtVindu gir en utrygg plan framfor å lyve når krymping er avslått", () => {
  const b = basseng(100n * E18, 300_000_000_000n);
  const plan = planleggTrygtVindu(5n * E18, b, 50n, USDC_PRIS, beregnSlippasje, STANDARD_ANGRIPER, false);
  assert.equal(plan.inn, 5n * E18);
  assert.equal(plan.mev.trygtOffentlig, false, "planen skal innrømme at den er utrygg");
});

test("krympTilToleranse gir opp framfor å anbefale en mikrohandel", () => {
  // Enorm handel i et tynt basseng: ingen størrelse over promillegulvet kommer
  // opp på en brukbar toleranse, og da er svaret «ikke her», ikke «støvkorn».
  const tynt = basseng(2n * E18, 6_000_000_000n);
  const resultat = krympTilToleranse(
    100_000n * E18,
    tynt,
    MIN_BRUKBAR_TOLERANSE_BPS,
    USDC_PRIS,
    STANDARD_ANGRIPER,
    beregnSlippasje,
  );
  assert.equal(resultat, null);
});

test("simulerSandwich avviser en handel som allerede reverterer", () => {
  const b = basseng(100n * E18, 300_000_000_000n);
  const s = beregnSlippasje(5n * E18, b, 0n);
  // minUt over forventet utfall: umulig fra start.
  assert.throws(() => simulerSandwich(5n * E18, b, s.forventetUt + 1n));
});

test("null vindu gir null tap, og angrepet blir ulønnsomt for angriperen", () => {
  const b = basseng(1_000_000n * E18, 3_000_000_000_000_000n);
  const s = beregnSlippasje(E18, b, 0n);
  const angrep = simulerSandwich(E18, b, s.minUt);

  assert.equal(angrep.offerTapUt, 0n, "med minUt = forventetUt kan ingenting hentes fra oss");
  // Front-run kan være teknisk mulig fordi kontraktens heltallsdivisjon gjør at
  // en meget liten prisendring ikke flytter vårt utbeløp i det hele tatt. Den
  // slakken er reell, men verdiløs: angriperen betaler to bassenggebyrer for
  // ingenting og går i minus.
  assert.ok(
    angrep.angriperBruttoInn < 0n,
    `angriperen skal tape penger, fikk ${angrep.angriperBruttoInn}`,
  );
});
