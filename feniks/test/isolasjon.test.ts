import { test } from "node:test";
import assert from "node:assert/strict";
import { PengeFeil } from "../src/kjerne/penger.ts";
import {
  GODKJENNINGSREGEL,
  Hvelvrotasjon,
  STANDARD_ISOLASJON,
  UENDELIG_UINT256,
  maksEksponering,
  minsteHvelvSaldo,
  planleggIsolasjon,
  sjekkGodkjenning,
  type Hvelv,
  type IsolasjonsValg,
} from "../src/orkestrator/lommebokisolasjon.ts";

function hvelv(id: string, tildeltCent: bigint, over: Partial<Hvelv> = {}): Hvelv {
  return {
    id,
    adresse: `0x${id}`,
    signererHandtak: `kms://${id}`,
    tildeltCent,
    handler: 0,
    status: "aktiv",
    ...over,
  };
}

test("minsteHvelvSaldo gjør 5-prosentporten om til et konkret kapitalkrav", () => {
  // 3 USD friksjon, 5 %-tak, 1 % forventet margin → 6 000 USD per hvelv.
  assert.equal(minsteHvelvSaldo(300n, 500n, 100n), 600_000n);
  // Dobbelt så god margin halverer kravet.
  assert.equal(minsteHvelvSaldo(300n, 500n, 200n), 300_000n);
  // Billigere kjede halverer det også.
  assert.equal(minsteHvelvSaldo(150n, 500n, 100n), 300_000n);
});

test("minsteHvelvSaldo avviser umulige parametre framfor å dele på null", () => {
  assert.throws(() => minsteHvelvSaldo(300n, 0n, 100n), PengeFeil);
  assert.throws(() => minsteHvelvSaldo(300n, 500n, 0n), PengeFeil);
});

test("en rikelig katalysator får alle fem branncellene", () => {
  // 5 × 6 000 USD kreves; vi gir 50 000 USD.
  const plan = planleggIsolasjon(5_000_000n, STANDARD_ISOLASJON);
  assert.equal(plan.antall, 5);
  assert.equal(plan.avvik, null);
  assert.equal(plan.levedyktig, true);
  assert.ok(plan.perHvelvCent >= plan.minsteSaldoCent);
});

test("fragmentering reduseres framfor å levere hvelv som ikke kan handle", () => {
  // 15 000 USD tåler bare to hvelv à 6 000 USD, ikke fem à 3 000.
  const plan = planleggIsolasjon(1_500_000n, STANDARD_ISOLASJON);
  assert.equal(plan.antall, 2);
  assert.ok(plan.avvik !== null);
  assert.match(plan.avvik!, /redusert fra 5 til 2/);
  assert.match(plan.avvik!, /friksjonsport/);
  assert.equal(plan.levedyktig, true);
});

test("en katalysator under minstekravet får en ærlig avvisning, ikke en oppdeling", () => {
  // Dette er 309 coins-tilfellet i praksis: for lite kapital for friksjonsnivået.
  const plan = planleggIsolasjon(100_000n, STANDARD_ISOLASJON); // 1 000 USD
  assert.equal(plan.levedyktig, false);
  assert.equal(plan.antall, 1);
  assert.match(plan.avvik!, /under minstekravet/);
  // Forklaringen skal peke på de to reelle utveiene.
  assert.match(plan.avvik!, /lavere friksjon|marginkravet/);
});

test("en billig kjede med god margin gjør full fragmentering levedyktig", () => {
  // Samme kapital som over, men L2-friksjon og 3 % margin.
  const billig: IsolasjonsValg = {
    ...STANDARD_ISOLASJON,
    friksjonPerOperasjonCent: 5n, // 5 cent
    forventetMarginBps: 300n,
    finansieringsgassCent: 3n,
  };
  const plan = planleggIsolasjon(100_000n, billig);
  assert.equal(plan.antall, 5);
  assert.equal(plan.levedyktig, true);

  // Dette er det kvantitative argumentet for L2, og det er stort: minstekravet
  // per hvelv faller fra 6 000 USD (L1, 1 % margin) til 33,34 USD — en faktor
  // på rundt 180. Fem brannceller går fra umulig til trivielt.
  const paaL1 = minsteHvelvSaldo(300n, 500n, 100n);
  assert.equal(plan.minsteSaldoCent, 3_334n);
  assert.ok(
    plan.minsteSaldoCent * 100n < paaL1,
    `minstekrav ${plan.minsteSaldoCent} cent skal være over 100x lavere enn ${paaL1} cent`,
  );
});

test("oppsettsgassen trekkes fra før kapitalen fordeles", () => {
  const plan = planleggIsolasjon(5_000_000n, STANDARD_ISOLASJON);
  assert.equal(plan.oppsettskostnadCent, STANDARD_ISOLASJON.finansieringsgassCent * 5n);
  assert.equal(plan.perHvelvCent * 5n + plan.oppsettskostnadCent <= 5_000_000n, true);
});

test("planleggIsolasjon avviser tomme og negative katalysatorer", () => {
  assert.throws(() => planleggIsolasjon(0n), PengeFeil);
  assert.throws(() => planleggIsolasjon(-1n), PengeFeil);
  assert.throws(() => planleggIsolasjon(1_000n, { ...STANDARD_ISOLASJON, onsketAntall: 0 }), PengeFeil);
});

test("eksponeringstaket begrenser hva én handel kan bruke av et hvelv", () => {
  const h = hvelv("a", 1_000_000n);
  // 5 000 bp = halvparten.
  assert.equal(maksEksponering(h, STANDARD_ISOLASJON), 500_000n);
});

test("rotasjonen pensjonerer et hvelv etter kvoten", () => {
  const r = new Hvelvrotasjon([hvelv("a", 1_000_000n), hvelv("b", 1_000_000n)], STANDARD_ISOLASJON);

  const forste = r.neste(100_000n);
  assert.equal(forste?.id, "a");
  const etter = r.bokfor("a");
  assert.equal(etter.status, "pensjonert", "handlerForRotasjon er 1");

  const andre = r.neste(100_000n);
  assert.equal(andre?.id, "b", "rotasjonen skal gå videre til neste branncelle");
});

test("rotasjonen hopper over hvelv uten nok eksponeringsrom", () => {
  const r = new Hvelvrotasjon([hvelv("liten", 1_000n), hvelv("stor", 1_000_000n)], STANDARD_ISOLASJON);
  const valgt = r.neste(400_000n);
  assert.equal(valgt?.id, "stor");
});

test("et kompromittert hvelv brukes aldri igjen", () => {
  const r = new Hvelvrotasjon([hvelv("a", 1_000_000n), hvelv("b", 1_000_000n)], STANDARD_ISOLASJON);
  r.kompromittert("a");
  assert.equal(r.aktive.length, 1);
  assert.equal(r.neste(100_000n)?.id, "b");
  // Selv etter en full runde.
  assert.notEqual(r.neste(100_000n)?.id, "a");
});

test("rotasjonen returnerer null i stedet for å tvinge en handel gjennom", () => {
  const r = new Hvelvrotasjon([hvelv("a", 1_000n)], STANDARD_ISOLASJON);
  assert.equal(r.neste(1_000_000n), null);
});

test("rotasjonen avviser ukjente hvelv og tomme sett", () => {
  assert.throws(() => new Hvelvrotasjon([], STANDARD_ISOLASJON), PengeFeil);
  const r = new Hvelvrotasjon([hvelv("a", 1_000n)], STANDARD_ISOLASJON);
  assert.throws(() => r.bokfor("finnes-ikke"), PengeFeil);
  assert.throws(() => r.kompromittert("finnes-ikke"), PengeFeil);
});

test("uendelig godkjenning avvises — det er den vanligste tømmingsmekanismen", () => {
  assert.throws(() => sjekkGodkjenning(UENDELIG_UINT256, 1_000n), PengeFeil);
  assert.throws(
    () => sjekkGodkjenning(UENDELIG_UINT256, 1_000n),
    /pensjonert lommebok/,
  );
});

test("godkjenning over handelens behov avvises", () => {
  assert.throws(() => sjekkGodkjenning(2_000n, 1_000n), PengeFeil);
  // Nøyaktig beløp er greit.
  assert.doesNotThrow(() => sjekkGodkjenning(1_000n, 1_000n));
  assert.doesNotThrow(() => sjekkGodkjenning(500n, 1_000n));
});

test("godkjenningsregelen tillater ikke uendelig, og krever utløp", () => {
  assert.equal(GODKJENNINGSREGEL.tillatUendelig, false);
  assert.equal(GODKJENNINGSREGEL.trekkTilbakeEtterpaa, true);
  assert.ok(GODKJENNINGSREGEL.maksUtlopSek <= 300, "en Permit2-signatur skal være kortlevd");
});
