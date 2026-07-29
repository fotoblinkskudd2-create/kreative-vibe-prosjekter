import { test } from "node:test";
import assert from "node:assert/strict";
import { Ratebudsjett } from "../src/agent11-portner/ratebudsjett.ts";
import { Kretsbryter } from "../src/agent11-portner/kretsbryter.ts";
import { Cache } from "../src/agent11-portner/cache.ts";
import { planlegg, retrybar, ventetidMs } from "../src/agent11-portner/backoff.ts";
import { KildeAvvist, apneKilde, tilgjengeligeKilder } from "../src/agent11-portner/kilder.ts";
import { Portner, type Forespoersel, type Henter, type RaSvar } from "../src/agent11-portner/index.ts";

/** Klokke vi styrer selv, slik at ingen test venter på virkelig tid. */
class Testklokke {
  constructor(private tid = 1_000_000) {}
  na(): number {
    return this.tid;
  }
  gaa(ms: number): void {
    this.tid += ms;
  }
}

const ENV = { EBAY_CLIENT_ID: "id", EBAY_CLIENT_SECRET: "hemmelig" };

// ---------------------------------------------------------------- ratebudsjett

test("ratebudsjettet holder seg under den publiserte grensen", () => {
  const k = new Testklokke();
  // 100 kall per sekund, men vi tillater oss bare 50 % av det.
  const b = new Ratebudsjett("test", { grensePerPeriode: 100, periodeMs: 1_000, utnyttelse: 0.5, burst: 5 }, k);

  // Burst på 5 tas ut umiddelbart, deretter er bøtta tom.
  for (let i = 0; i < 5; i++) assert.equal(b.prov(), true, `kall ${i} skulle gått gjennom`);
  assert.equal(b.prov(), false, "bursten skal være oppbrukt");

  // Etter ett sekund har vi tjent 50 tokens, men kapasiteten er 5.
  k.gaa(1_000);
  let tatt = 0;
  while (b.prov()) tatt++;
  assert.equal(tatt, 5, "bøtta kan ikke overstige burst-kapasiteten");
});

test("ratebudsjettet refyller kontinuerlig, ikke i vindussprang", () => {
  const k = new Testklokke();
  const b = new Ratebudsjett("test", { grensePerPeriode: 1_000, periodeMs: 1_000, utnyttelse: 1, burst: 1 }, k);
  assert.equal(b.prov(), true);
  assert.equal(b.prov(), false);
  // 1000 tokens per sekund = ett per millisekund.
  k.gaa(1);
  assert.equal(b.prov(), true, "ett token skal være tjent opp etter 1 ms");
});

test("ventetidMs sier når neste token kommer", () => {
  const k = new Testklokke();
  const b = new Ratebudsjett("test", { grensePerPeriode: 100, periodeMs: 10_000, utnyttelse: 1, burst: 1 }, k);
  b.prov();
  const vent = b.ventetidMs();
  assert.ok(vent > 0, "tom bøtte skal ha positiv ventetid");
  k.gaa(vent);
  assert.equal(b.prov(), true, "etter oppgitt ventetid skal kallet gå gjennom");
});

test("struping tømmer bøtta fordi kilden nettopp motbeviste vår modell", () => {
  const k = new Testklokke();
  const b = new Ratebudsjett("test", { grensePerPeriode: 100, periodeMs: 1_000, utnyttelse: 1, burst: 10 }, k);
  assert.ok(b.igjen >= 9);
  b.strupet();
  assert.equal(b.prov(), false);
});

test("ratebudsjettet avviser ugyldig konfigurasjon i stedet for å gjette", () => {
  const gyldig = { grensePerPeriode: 10, periodeMs: 1_000, utnyttelse: 0.5, burst: 1 };
  assert.throws(() => new Ratebudsjett("x", { ...gyldig, grensePerPeriode: 0 }));
  assert.throws(() => new Ratebudsjett("x", { ...gyldig, utnyttelse: 0 }));
  assert.throws(() => new Ratebudsjett("x", { ...gyldig, utnyttelse: 1.5 }));
  assert.throws(() => new Ratebudsjett("x", { ...gyldig, burst: 0 }));
});

// ----------------------------------------------------------------- kretsbryter

test("kretsbryteren åpner etter terskelen og slipper gjennom igjen etter pausen", () => {
  const k = new Testklokke();
  const b = new Kretsbryter("test", { feilterskel: 3, pauseMs: 1_000, maksPauseMs: 10_000 }, k);

  assert.equal(b.slipperGjennom(), true);
  b.feilet();
  b.feilet();
  assert.equal(b.status, "lukket", "to feil er under terskelen");
  b.feilet();
  assert.equal(b.status, "aapen");
  assert.equal(b.slipperGjennom(), false);

  k.gaa(1_000);
  assert.equal(b.slipperGjennom(), true, "etter pausen slippes ett prøvekall gjennom");
  assert.equal(b.status, "halvaapen");
  b.lykkes();
  assert.equal(b.status, "lukket");
});

test("et feilet prøvekall dobler pausen framfor å spørre like ofte", () => {
  const k = new Testklokke();
  const b = new Kretsbryter("test", { feilterskel: 1, pauseMs: 1_000, maksPauseMs: 10_000 }, k);
  b.feilet();
  assert.equal(b.status, "aapen");

  k.gaa(1_000);
  assert.equal(b.slipperGjennom(), true);
  b.feilet(); // prøvekallet feilet
  assert.equal(b.status, "aapen");

  k.gaa(1_000);
  assert.equal(b.slipperGjennom(), false, "pausen skal nå være 2 000 ms");
  k.gaa(1_000);
  assert.equal(b.slipperGjennom(), true);
});

test("pausen er begrenset av maksPauseMs", () => {
  const k = new Testklokke();
  const b = new Kretsbryter("test", { feilterskel: 1, pauseMs: 1_000, maksPauseMs: 4_000 }, k);
  for (let i = 0; i < 10; i++) {
    b.feilet();
    k.gaa(100_000);
    b.slipperGjennom();
  }
  b.tvingAapen(999_999);
  assert.ok(b.ventetidMs() <= 4_000, `ventetid ${b.ventetidMs()} skal ligge under taket`);
});

test("suksess nullstiller både telleren og pausen", () => {
  const k = new Testklokke();
  const b = new Kretsbryter("test", { feilterskel: 2, pauseMs: 1_000, maksPauseMs: 10_000 }, k);
  b.feilet();
  b.lykkes();
  b.feilet();
  assert.equal(b.status, "lukket", "telleren skal ha blitt nullstilt av suksessen");
});

// ----------------------------------------------------------------------- cache

test("cachen skiller ferske treff fra utløpte", () => {
  const k = new Testklokke();
  const c = new Cache<string>(10, k);
  c.lagre("a", "verdi", 1_000);
  assert.deepEqual(c.slaaOpp("a"), { status: "fersk", verdi: "verdi" });

  k.gaa(1_001);
  const treff = c.slaaOpp("a");
  assert.equal(treff.status, "utloept");
  assert.equal(treff.status === "utloept" ? treff.verdi : null, "verdi");
});

test("cachen nekter å lagre når kilden ikke tillater lagring", () => {
  const c = new Cache<string>(10, new Testklokke());
  c.lagre("a", "verdi", 0);
  assert.deepEqual(c.slaaOpp("a"), { status: "tomt" });
});

test("revalidering forlenger et utløpt treff etter 304", () => {
  const k = new Testklokke();
  const c = new Cache<string>(10, k);
  c.lagre("a", "verdi", 1_000, "etag-1");
  k.gaa(2_000);
  assert.equal(c.slaaOpp("a").status, "utloept");
  assert.equal(c.revalider("a", 1_000), true);
  assert.equal(c.slaaOpp("a").status, "fersk");
});

test("cachen kaster ut den minst brukte posten ved full kapasitet", () => {
  const k = new Testklokke();
  const c = new Cache<string>(2, k);
  c.lagre("a", "A", 10_000);
  k.gaa(1);
  c.lagre("b", "B", 10_000);
  k.gaa(1);
  c.slaaOpp("a"); // gjør "a" nyest brukt
  k.gaa(1);
  c.lagre("ny", "N", 10_000);

  assert.equal(c.antall, 2);
  assert.equal(c.slaaOpp("b").status, "tomt", "«b» var minst nylig brukt");
  assert.equal(c.slaaOpp("a").status, "fersk");
});

// --------------------------------------------------------------------- backoff

test("bare 429, 408 og 5xx gjentas", () => {
  assert.equal(retrybar({ kode: 429 }), "gjenta");
  assert.equal(retrybar({ kode: 408 }), "gjenta");
  assert.equal(retrybar({ kode: 503 }), "gjenta");
  assert.equal(retrybar({ kode: 403 }), "gi-opp");
  assert.equal(retrybar({ kode: 401 }), "gi-opp");
  assert.equal(retrybar({ kode: 404 }), "gi-opp");
});

test("Retry-After overstyrer vår egen beregning", () => {
  const valg = { forsteMs: 100, takMs: 60_000, maksForsok: 5, tilfeldig: () => 0.5 };
  assert.equal(ventetidMs(1, { kode: 429, retryAfterSek: 30 }, valg), 30_000);
  // Også når vår egen beregning ville vært mye kortere.
  assert.equal(ventetidMs(1, { kode: 429, retryAfterSek: 45 }, valg), 45_000);
});

test("Retry-After begrenses av taket", () => {
  const valg = { forsteMs: 100, takMs: 5_000, maksForsok: 5, tilfeldig: () => 1 };
  assert.equal(ventetidMs(1, { kode: 429, retryAfterSek: 3_600 }, valg), 5_000);
});

test("full jitter sprer retries i stedet for å synkronisere dem", () => {
  const valg = { forsteMs: 100, takMs: 60_000, maksForsok: 8, tilfeldig: () => 1 };
  // Taket dobles per forsøk …
  assert.equal(ventetidMs(1, { kode: 500 }, valg), 100);
  assert.equal(ventetidMs(2, { kode: 500 }, valg), 200);
  assert.equal(ventetidMs(4, { kode: 500 }, valg), 800);
  // … men den faktiske ventetiden er uniform under taket, ikke lik taket.
  const lav = { ...valg, tilfeldig: () => 0 };
  assert.equal(ventetidMs(4, { kode: 500 }, lav), 0);
});

test("planlegg gir opp når forsøkene er brukt opp", () => {
  const valg = { forsteMs: 100, takMs: 1_000, maksForsok: 2, tilfeldig: () => 0.5 };
  assert.ok(planlegg({ kode: 500 }, 0, valg) !== null);
  assert.ok(planlegg({ kode: 500 }, 1, valg) !== null);
  assert.equal(planlegg({ kode: 500 }, 2, valg), null);
  assert.equal(planlegg({ kode: 403 }, 0, valg), null, "403 skal aldri gjentas");
});

// ---------------------------------------------------------------------- kilder

test("en kilde uten lovlig programmatisk vei kan ikke åpnes", () => {
  assert.throws(
    () => apneKilde("temu", ENV),
    (feil: unknown) => feil instanceof KildeAvvist && /ingen lovlig/.test((feil as Error).message),
  );
});

test("manglende legitimasjon nevner hvilke variabler som mangler", () => {
  assert.throws(
    () => apneKilde("ebay", {}),
    (feil: unknown) =>
      feil instanceof KildeAvvist && /EBAY_CLIENT_ID/.test((feil as Error).message),
  );
});

test("en kilde med legitimasjon åpnes", () => {
  const k = apneKilde("ebay", ENV);
  assert.equal(k.tilgang, "lisensiert-api");
  assert.ok(k.kvote);
});

test("tilgjengeligeKilder utelater både temu og kilder uten nøkler", () => {
  const tilgjengelig = tilgjengeligeKilder(ENV);
  assert.ok(tilgjengelig.includes("ebay"));
  assert.ok(tilgjengelig.includes("coingecko"), "coingecko krever ingen nøkkel");
  assert.ok(!tilgjengelig.includes("temu"));
  assert.ok(!tilgjengelig.includes("x"), "X mangler bearer-token i dette miljøet");
});

// --------------------------------------------------------------------- portner

class FalskHenter implements Henter {
  kall: Forespoersel[] = [];
  constructor(private svar: RaSvar[] | ((f: Forespoersel) => RaSvar)) {}
  async utfor(f: Forespoersel): Promise<RaSvar> {
    this.kall.push(f);
    if (typeof this.svar === "function") return this.svar(f);
    const neste = this.svar.shift();
    if (!neste) throw new Error("ingen flere forberedte svar");
    return neste;
  }
}

function ok(kropp: unknown, etag?: string): RaSvar {
  return { kode: 200, kropp: JSON.stringify(kropp), hoder: etag ? { etag } : {} };
}

test("Portneren nekter å registrere en kilde uten lovlig vei", () => {
  const p = new Portner(new FalskHenter([]), undefined, undefined, new Testklokke(), ENV);
  assert.throws(() => p.registrer("temu"), KildeAvvist);
});

test("et ferskt cachetreff koster verken kvote eller nettverk", async () => {
  const k = new Testklokke();
  const henter = new FalskHenter([ok({ n: 1 })]);
  const p = new Portner(henter, undefined, undefined, k, ENV);
  p.registrer("ebay");

  const forste = await p.hent<{ n: number }>("ebay", "/item/1");
  assert.deepEqual(forste, { ok: true, data: { n: 1 }, fraCache: false });

  const andre = await p.hent<{ n: number }>("ebay", "/item/1");
  assert.deepEqual(andre, { ok: true, data: { n: 1 }, fraCache: true });
  assert.equal(henter.kall.length, 1, "det andre kallet skal ikke ha truffet nettverket");
});

test("Portneren identifiserer seg med kontaktpunkt", async () => {
  const henter = new FalskHenter([ok({})]);
  const p = new Portner(henter, undefined, undefined, new Testklokke(), {
    ...ENV,
    FENIKS_KONTAKT: "drift@example.org",
  });
  p.registrer("ebay");
  await p.hent("ebay", "/x");

  assert.match(henter.kall[0]!.hoder["user-agent"]!, /drift@example\.org/);
});

test("429 tømmer kvoten og tvinger kretsbryteren åpen", async () => {
  const k = new Testklokke();
  const henter = new FalskHenter([{ kode: 429, kropp: "", hoder: { "retry-after": "120" } }]);
  const p = new Portner(henter, undefined, undefined, k, ENV);
  p.registrer("ebay");

  const svar = await p.hent("ebay", "/x");
  assert.equal(svar.ok, false);
  assert.ok(!svar.ok && svar.ventMs > 0);

  // Neste kall skal ikke nå nettverket i det hele tatt.
  const igjen = await p.hent("ebay", "/y");
  assert.equal(igjen.ok, false);
  assert.equal(henter.kall.length, 1, "kretsbryteren skal ha stoppet det andre kallet");
});

test("403 gjentas ikke — det er en konfigurasjonsfeil, ikke en hikke", async () => {
  const k = new Testklokke();
  const henter = new FalskHenter(() => ({ kode: 403, kropp: "", hoder: {} }));
  const p = new Portner(henter, undefined, undefined, k, ENV);
  p.registrer("ebay");

  await p.hent("ebay", "/x");
  await p.hent("ebay", "/y");
  assert.equal(henter.kall.length, 1, "et 403 skal ta kilden ut, ikke utløse nye forsøk");
});

test("utløpt cache er bedre enn ingen data når kilden er ute", async () => {
  const k = new Testklokke();
  const henter = new FalskHenter([ok({ n: 1 }), { kode: 500, kropp: "", hoder: {} }]);
  const p = new Portner(henter, undefined, undefined, k, ENV);
  p.registrer("ebay");

  await p.hent("ebay", "/item/1");
  k.gaa(7 * 60 * 60 * 1000); // forbi eBays cachetak på 6 timer

  const svar = await p.hent<{ n: number }>("ebay", "/item/1");
  assert.equal(svar.ok, true);
  assert.deepEqual(svar.ok ? svar.data : null, { n: 1 });
  assert.equal(svar.ok ? svar.fraCache : null, true);
});

test("304 revaliderer cachen uten å laste kroppen på nytt", async () => {
  const k = new Testklokke();
  const henter = new FalskHenter([
    ok({ n: 1 }, "etag-1"),
    { kode: 304, kropp: "", hoder: {} },
  ]);
  const p = new Portner(henter, undefined, undefined, k, ENV);
  p.registrer("ebay");

  await p.hent("ebay", "/item/1");
  k.gaa(7 * 60 * 60 * 1000);
  const svar = await p.hent<{ n: number }>("ebay", "/item/1");

  assert.equal(svar.ok, true);
  assert.deepEqual(svar.ok ? svar.data : null, { n: 1 });
  assert.match(henter.kall[1]!.hoder["if-none-match"]!, /etag-1/);
});

test("nettverksfeil degraderer i stedet for å kaste", async () => {
  const henter: Henter = {
    utfor: async () => {
      throw new Error("ECONNRESET");
    },
  };
  const p = new Portner(henter, undefined, undefined, new Testklokke(), ENV);
  p.registrer("ebay");

  const svar = await p.hent("ebay", "/x");
  assert.equal(svar.ok, false);
  assert.equal(svar.ok ? null : svar.arsak, "nettverksfeil");
});

test("harLevendeKilde forteller Orkestratoren om løkken har input", async () => {
  const k = new Testklokke();
  const henter = new FalskHenter(() => ({ kode: 429, kropp: "", hoder: { "retry-after": "600" } }));
  const p = new Portner(henter, undefined, undefined, k, ENV);
  p.registrer("ebay");
  assert.equal(p.harLevendeKilde(), true);

  await p.hent("ebay", "/x");
  assert.equal(p.harLevendeKilde(), false, "den eneste kilden er tatt ut");
  assert.equal(p.helse()[0]!.bryter, "aapen");
});

test("et ukjent kildenavn degraderer i stedet for å kaste", async () => {
  const p = new Portner(new FalskHenter([]), undefined, undefined, new Testklokke(), ENV);
  const svar = await p.hent("finnes-ikke", "/x");
  assert.equal(svar.ok, false);
});
