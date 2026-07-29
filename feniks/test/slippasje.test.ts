import { test } from "node:test";
import assert from "node:assert/strict";
import { PengeFeil } from "../src/kjerne/penger.ts";
import {
  bassengEtter,
  beregnSlippasje,
  innBelop,
  utBelop,
} from "../src/agent12-livvakten/slippasje.ts";
import type { Basseng, Eiendel } from "../src/kjerne/typer.ts";

const WETH: Eiendel = { symbol: "WETH", adresse: "0x1", desimaler: 18, kjede: "ethereum" };
const USDC: Eiendel = { symbol: "USDC", adresse: "0x2", desimaler: 6, kjede: "ethereum" };

const E18 = 10n ** 18n;

function basseng(reserveInn: bigint, reserveUt: bigint, gebyrBps = 30n): Basseng {
  return { inn: WETH, ut: USDC, reserveInn, reserveUt, gebyrBps, lestVed: 1_000 };
}

test("utBelop reproduserer Uniswap V2 sin 997/1000-formel", () => {
  const inn = E18;
  const rInn = 1000n * E18;
  const rUt = 1000n * E18;

  // Referanse regnet direkte med 997/1000, slik kontrakten gjør det.
  const medFee = inn * 997n;
  const referanse = (medFee * rUt) / (rInn * 1000n + medFee);

  assert.equal(utBelop(inn, rInn, rUt, 30n), referanse);
});

test("utBelop gir mindre ut per enhet når handelen blir større", () => {
  const b = basseng(1000n * E18, 1000n * E18);
  const liten = utBelop(E18, b.reserveInn, b.reserveUt, b.gebyrBps);
  const stor = utBelop(100n * E18, b.reserveInn, b.reserveUt, b.gebyrBps);
  // 100x innsats gir strengt mindre enn 100x utbetaling — det er dybdepåvirkningen.
  assert.ok(stor < liten * 100n, `${stor} skal være under ${liten * 100n}`);
});

test("utBelop avviser tomme basseng og ikke-positive innbeløp", () => {
  assert.throws(() => utBelop(0n, E18, E18, 30n), PengeFeil);
  assert.throws(() => utBelop(E18, 0n, E18, 30n), PengeFeil);
  assert.throws(() => utBelop(E18, E18, 0n, 30n), PengeFeil);
});

test("utBelop avviser urimelige bassenggebyrer", () => {
  assert.throws(() => utBelop(E18, E18, E18, -1n), PengeFeil);
  assert.throws(() => utBelop(E18, E18, E18, 10_000n), PengeFeil);
});

test("innBelop runder oppover slik at handelen ikke reverterer på én enhet", () => {
  const rInn = 1000n * E18;
  const rUt = 2_000_000_000n; // 2000 USDC med 6 desimaler
  const onsket = 1_000_000n; // 1 USDC

  const kreves = innBelop(onsket, rInn, rUt, 30n);
  const faktisk = utBelop(kreves, rInn, rUt, 30n);
  assert.ok(faktisk >= onsket, `${faktisk} skal dekke ${onsket}`);

  // Én enhet mindre skal ikke lenger holde — grensen er tett, ikke slapp.
  const forLite = utBelop(kreves - 1n, rInn, rUt, 30n);
  assert.ok(forLite < onsket || kreves - 1n === 0n);
});

test("innBelop avviser uttak som overstiger reserven", () => {
  assert.throws(() => innBelop(E18, E18, E18, 30n), PengeFeil);
});

test("beregnSlippasje skiller gebyr fra dybdepåvirkning", () => {
  // Et dypt basseng: gebyret dominerer, dybdepåvirkningen er nesten null.
  const dypt = beregnSlippasje(E18, basseng(1_000_000n * E18, 1_000_000n * E18), 50n);
  assert.ok(dypt.prisimpaktBps <= 1n, `dybdepåvirkning ${dypt.prisimpaktBps} bp skal være ~0`);
  assert.ok(dypt.totalkostnadBps >= 30n, "totalkostnaden må minst dekke gebyret");

  // Et tynt basseng med samme handel: nå dominerer dybdepåvirkningen.
  const tynt = beregnSlippasje(E18, basseng(10n * E18, 10n * E18), 50n);
  assert.ok(
    tynt.prisimpaktBps > dypt.prisimpaktBps * 100n,
    `tynt basseng (${tynt.prisimpaktBps} bp) skal ha langt høyere impakt enn dypt (${dypt.prisimpaktBps} bp)`,
  );
});

test("minUt følger toleransen eksakt", () => {
  const s = beregnSlippasje(E18, basseng(1000n * E18, 1000n * E18), 100n); // 1 %
  assert.equal(s.minUt, (s.forventetUt * 9900n) / 10_000n);
  assert.equal(s.toleranseBps, 100n);
});

test("toleranse på null gir minUt lik forventetUt", () => {
  const s = beregnSlippasje(E18, basseng(1000n * E18, 1000n * E18), 0n);
  assert.equal(s.minUt, s.forventetUt);
});

test("beregnSlippasje avviser ugyldig toleranse", () => {
  const b = basseng(1000n * E18, 1000n * E18);
  assert.throws(() => beregnSlippasje(E18, b, -1n), PengeFeil);
  assert.throws(() => beregnSlippasje(E18, b, 10_000n), PengeFeil);
});

test("bassengEtter bevarer konstantproduktet oppover", () => {
  const b = basseng(1000n * E18, 1000n * E18);
  const etter = bassengEtter(E18, b);
  assert.ok(etter.reserveInn > b.reserveInn);
  assert.ok(etter.reserveUt < b.reserveUt);
  // Gebyret gjør at produktet vokser; det er hvordan LP-ene tjener penger.
  assert.ok(etter.reserveInn * etter.reserveUt >= b.reserveInn * b.reserveUt);
});
