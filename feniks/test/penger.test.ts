import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BPS,
  PengeFeil,
  andelBps,
  formater,
  minusBps,
  skaler,
  sum,
  tilBps,
} from "../src/kjerne/penger.ts";

test("andelBps regner brøkdeler eksakt på heltall", () => {
  assert.equal(andelBps(10_000n, 30n), 30n);
  assert.equal(andelBps(1_000_000n, 250n), 25_000n);
  assert.equal(andelBps(123n, BPS), 123n);
});

test("andelBps runder ned slik at mottatt beløp aldri overdrives", () => {
  // 1 % av 99 er 0,99 — vi påstår 0, ikke 1.
  assert.equal(andelBps(99n, 100n), 0n);
});

test("minusBps trekker fra en andel", () => {
  assert.equal(minusBps(10_000n, 30n), 9_970n);
  assert.equal(minusBps(1n, 0n), 1n);
});

test("minusBps avviser andeler over 100 prosent", () => {
  assert.throws(() => minusBps(100n, BPS + 1n), PengeFeil);
});

test("tilBps runder opp slik at kostnad aldri underdrives", () => {
  // 1 av 10 000 er eksakt 1 bp.
  assert.equal(tilBps(1n, 10_000n), 1n);
  // 1 av 20 000 er 0,5 bp — som kostnad påstår vi 1 bp, ikke 0.
  assert.equal(tilBps(1n, 20_000n), 1n);
  assert.equal(tilBps(500n, 10_000n), 500n);
});

test("tilBps avviser null som helhet", () => {
  assert.throws(() => tilBps(1n, 0n), PengeFeil);
});

test("skaler flytter mellom ulike desimaler", () => {
  // USDC (6) til WETH (18)
  assert.equal(skaler(1_000_000n, 6, 18), 10n ** 18n);
  // og tilbake
  assert.equal(skaler(10n ** 18n, 18, 6), 1_000_000n);
  assert.equal(skaler(42n, 8, 8), 42n);
});

test("skaler nedover mister presisjon, ikke korrekthet", () => {
  // 1 wei kan ikke uttrykkes i 6 desimaler; svaret er 0, ikke en avrundingsfeil.
  assert.equal(skaler(1n, 18, 6), 0n);
});

test("sum unngår mellomliggende flyttallssteg", () => {
  const mange = Array.from({ length: 1000 }, () => 1n);
  assert.equal(sum(mange), 1000n);
  assert.equal(sum([]), 0n);
});

test("formater er lesbart og bevarer alle desimaler", () => {
  assert.equal(formater(1_500_000n, 6, "USDC"), "1.500000 USDC");
  assert.equal(formater(1n, 18), "0.000000000000000001");
  assert.equal(formater(-250n, 2, "USD"), "-2.50 USD");
  assert.equal(formater(309n, 0, "coins"), "309 coins");
});
