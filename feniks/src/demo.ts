/**
 * Kjørbar gjennomgang: hva portene faktisk gjør med tallene i denne modellen.
 *
 *   node --experimental-transform-types src/demo.ts
 *
 * Katalysatoren er oppgitt som «309 coins» uten at det er sagt hvilken coin, så
 * demoen regner ikke med én verdi — den viser utfallet over et spekter, fordi
 * det er nettopp verdien per coin som avgjør om modellen er kjørbar. Er de 309
 * coins verdt 300 USD, dør alt på L1. Er de verdt 300 000 USD, går det.
 */

import { formater } from "./kjerne/penger.ts";
import { beregnSlippasje } from "./agent12-livvakten/slippasje.ts";
import { planleggTrygtVindu, vurderMev, type Pris } from "./agent12-livvakten/mev.ts";
import { beskyttelseFor } from "./agent12-livvakten/ruting.ts";
import { Skattemester, minimumLonnsomBrutto } from "./agent13-skattemester/index.ts";
import { beregnGass, type GassTilstand, type NativPris } from "./agent13-skattemester/gass.ts";
import { ledd } from "./agent13-skattemester/gebyrer.ts";
import { minsteHvelvSaldo, planleggIsolasjon, STANDARD_ISOLASJON } from "./orkestrator/lommebokisolasjon.ts";
import { tilgjengeligeKilder, KILDER } from "./agent11-portner/kilder.ts";
import type { Basseng, Eiendel, Kjede } from "./kjerne/typer.ts";

const E18 = 10n ** 18n;
const GWEI = 1_000_000_000n;
const ETH_PRIS: NativPris = { centPerEnhet: 300_000n, desimaler: 18 };
const USDC_PRIS: Pris = { centPerEnhet: 100n, desimaler: 6 };

function usd(cent: bigint): string {
  return formater(cent, 2, "USD");
}

function tittel(t: string): void {
  console.log(`\n${"═".repeat(78)}\n  ${t}\n${"═".repeat(78)}`);
}

// ─────────────────────────────────────────────── 1. Gasskostnad per kjede

tittel("1. Hva én handel koster i nettverksavgifter");

const kjeder: { kjede: Kjede; tilstand: GassTilstand }[] = [
  {
    kjede: "ethereum",
    tilstand: { kjede: "ethereum", baseFeeWei: 20n * GWEI, prioritetWei: GWEI, lestVed: 0 },
  },
  {
    kjede: "base",
    tilstand: {
      kjede: "base",
      baseFeeWei: 10_000_000n,
      prioritetWei: 1_000_000n,
      l1DataFeeWei: 2_000_000_000_000n,
      lestVed: 0,
    },
  },
];

const gassPerKjede = new Map<Kjede, bigint>();
for (const { kjede, tilstand } of kjeder) {
  const b = beregnGass(200_000n, tilstand, ETH_PRIS);
  // Tur-retur: inn og ut er to handler.
  const turRetur = b.maksUsd * 2n;
  gassPerKjede.set(kjede, turRetur);
  console.log(
    `  ${kjede.padEnd(10)} forventet ${usd(b.forventetUsd).padStart(12)}  ` +
      `budsjettert tak ${usd(b.maksUsd).padStart(12)}  tur-retur ${usd(turRetur).padStart(12)}`,
  );
}
console.log(
  `\n  Taket ligger over anslaget fordi EIP-1559 tillater +12,5 % basefee per\n` +
    `  blokk. Over fire blokker er det ~1,60x. Budsjetterer du på anslaget, er\n` +
    `  differansen ren lekkasje.`,
);

// ─────────────────────────────────────── 2. 20x-regelen, per kjede

tittel("2. Femprosentporten er en 20x-regel — her er terskelen den setter");

for (const [kjede, friksjon] of gassPerKjede) {
  const krav = minimumLonnsomBrutto(friksjon, 500n);
  console.log(
    `  ${kjede.padEnd(10)} friksjon ${usd(friksjon).padStart(12)}  →  ` +
      `minste brutto per operasjon ${usd(krav).padStart(14)}`,
  );
}
const l1Krav = minimumLonnsomBrutto(gassPerKjede.get("ethereum")!, 500n);
console.log(
  `\n  Dette er det viktigste enkelttallet i modellen. På L1 kan ingen operasjon\n` +
    `  under ${usd(l1Krav)} brutto noensinne passere porten, uansett hvor god\n` +
    `  arbitrasjen er. «Mikrodrenering» og en 5 %-port kan ikke sameksistere på L1.`,
);

// ───────────────────────────── 3. Katalysatoren: hva tåler den?

tittel("3. Katalysatoren på 309 coins — utfall etter verdi per coin");

const prisPerCoin = [100n, 1_000n, 10_000n, 100_000n]; // cent: 1, 10, 100, 1000 USD
console.log(
  `  ${"per coin".padEnd(12)}${"katalysator".padStart(14)}` +
    `${"L1: hvelv".padStart(14)}${"Base: hvelv".padStart(14)}   kommentar`,
);

for (const pris of prisPerCoin) {
  const katalysator = 309n * pris;
  const l1 = planleggIsolasjon(katalysator, {
    ...STANDARD_ISOLASJON,
    friksjonPerOperasjonCent: gassPerKjede.get("ethereum")!,
    finansieringsgassCent: 150n,
  });
  const base = planleggIsolasjon(katalysator, {
    ...STANDARD_ISOLASJON,
    friksjonPerOperasjonCent: gassPerKjede.get("base")!,
    finansieringsgassCent: 3n,
  });
  const merknad = !l1.levedyktig && base.levedyktig
    ? "kun L2 er kjørbart"
    : l1.levedyktig
      ? "begge kjørbare"
      : "for lite kapital for begge";
  console.log(
    `  ${usd(pris).padEnd(12)}${usd(katalysator).padStart(14)}` +
      `${String(l1.levedyktig ? l1.antall : 0).padStart(14)}` +
      `${String(base.levedyktig ? base.antall : 0).padStart(14)}   ${merknad}`,
  );
}

console.log(
  `\n  Minste hvelvsaldo, 1 % forventet margin:\n` +
    `    L1   ${usd(minsteHvelvSaldo(gassPerKjede.get("ethereum")!, 500n, 100n))}\n` +
    `    Base ${usd(minsteHvelvSaldo(gassPerKjede.get("base")!, 500n, 100n))}\n\n` +
    `  Fem brannceller er ikke en preferanse, det er en kapitalkostnad. Kravet\n` +
    `  faller med to størrelsesordener ved å flytte til L2 — det er den ene\n` +
    `  endringen som gjør både isolasjon og mikromarginer mulige samtidig.`,
);

// ──────────────────────────── 4. Skattemesteren på en konkret operasjon

tittel("4. Friksjonsporten på en konkret operasjon");

const sm = new Skattemester();
for (const [kjede, gass] of gassPerKjede) {
  const dom = sm.vurder(
    {
      id: `demo-${kjede}`,
      kjede,
      bruttoUsd: 4_000n, // 40 USD brutto
      innsatsUsd: 400_000n, // 4 000 USD innsats, altså 1 % margin
      levetidMs: 45_000,
      kilde: "demo",
    },
    [ledd("gass", gass, "anslag"), ledd("dex-gebyr", 240n, "kjent")],
  );
  console.log(
    `  ${kjede.padEnd(10)} ${dom.dom.utfall.toUpperCase().padEnd(9)} ` +
      `netto ${usd(dom.nettoCent).padStart(12)}  ` +
      `friksjon ${String(dom.friksjonsandelBps).padStart(6)} bp  (${dom.dom.arsak})`,
  );
}

// ──────────────────────────────── 5. Livvakten på en konkret handel

tittel("5. MEV-vinduet, og hva Livvakten gjør med det");

const WETH: Eiendel = { symbol: "WETH", adresse: "0x…", desimaler: 18, kjede: "ethereum" };
const USDC: Eiendel = { symbol: "USDC", adresse: "0x…", desimaler: 6, kjede: "ethereum" };
const basseng: Basseng = {
  inn: WETH,
  ut: USDC,
  reserveInn: 100n * E18,
  reserveUt: 300_000_000_000n,
  gebyrBps: 30n,
  lestVed: Date.now(),
};

for (const inn of [5n * E18, E18, E18 / 16n]) {
  const raa = vurderMev(beregnSlippasje(inn, basseng, 50n), USDC_PRIS);
  const plan = planleggTrygtVindu(inn, basseng, 50n, USDC_PRIS, beregnSlippasje);
  console.log(
    `  handel ${formater(inn, 18).padStart(10)} WETH  ` +
      `vindu ved 50 bp: ${usd(raa.vinduUsd).padStart(12)}  ` +
      `→ tiltak: ${plan.tiltak.join(" + ").padEnd(32)} ` +
      `endelig vindu ${usd(plan.mev.vinduUsd).padStart(9)} ` +
      `(${plan.toleranseBps} bp, trygt: ${plan.mev.trygtOffentlig})`,
  );
}
console.log(
  `\n  Angriperens terskel er ${usd(vurderMev(beregnSlippasje(E18, basseng, 50n), USDC_PRIS).angriperTerskelUsd)}. ` +
    `Ligger vinduet under den,\n  taper en sandwich penger på å angripe deg, og angrepet uteblir.\n\n` +
    `  Beskyttelsesform per kjede:`,
);
for (const kjede of ["ethereum", "base", "arbitrum", "polygon"] as Kjede[]) {
  console.log(`    ${kjede.padEnd(10)} ${beskyttelseFor(kjede)}`);
}

// ──────────────────────────────────────── 6. Portneren: hvilke kilder finnes

tittel("6. Datakilder — hva som faktisk er tilgjengelig");

const tilgjengelig = new Set(tilgjengeligeKilder(process.env));
for (const [navn, kilde] of Object.entries(KILDER)) {
  const status = tilgjengelig.has(navn)
    ? "KLAR"
    : kilde.tilgang === "ingen-vei"
      ? "INGEN VEI"
      : `mangler ${kilde.kreverEnv.join(", ")}`;
  console.log(`  ${navn.padEnd(12)} ${status.padEnd(34)} ${kilde.tilgang}`);
}
console.log(
  `\n  Temu har ingen offentlig produktdata-API. Det er ikke en begrensning\n` +
    `  Portneren innfører — det er en arkitekturfeil i modellen, og den er\n` +
    `  billigere å oppdage nå enn i syklus 10.`,
);

console.log();
