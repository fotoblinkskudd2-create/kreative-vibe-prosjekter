import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Frist, Hjerteslag, type PulsLager } from "../src/orkestrator/hjerteslag.ts";
import { FilPuls } from "../src/orkestrator/puls-lager.ts";
import { Vaktbikkje, type Drapsmann } from "../src/orkestrator/vaktbikkje.ts";
import { DockerDrapsmann } from "../src/orkestrator/vaktbikkje.ts";

class Testklokke {
  constructor(private tid = 1_000_000) {}
  na(): number {
    return this.tid;
  }
  gaa(ms: number): void {
    this.tid += ms;
  }
}

/** Puls-lager i minnet. Kun for test — i drift må lageret være utenfor prosessen. */
class MinnePuls implements PulsLager {
  readonly poster = new Map<string, { verdi: string; utloper: number }>();
  antallSkriv = 0;

  constructor(private readonly klokke: Testklokke) {}

  async skriv(nokkel: string, verdi: string, ttlMs: number): Promise<void> {
    this.antallSkriv += 1;
    this.poster.set(nokkel, { verdi, utloper: this.klokke.na() + ttlMs });
  }

  async les(nokkel: string): Promise<string | null> {
    const post = this.poster.get(nokkel);
    if (!post) return null;
    if (this.klokke.na() >= post.utloper) return null;
    return post.verdi;
  }
}

const VALG = {
  nokkel: "feniks:puls",
  intervallMs: 5 * 60_000,
  stillstandsgrenseMs: 10 * 60_000,
  pulsTtlMs: 12 * 60_000,
};

// ------------------------------------------------------------------ hjerteslag

test("hjerteslaget pulser så lenge løkken gjør fremgang", async () => {
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  const hs = new Hjerteslag(lager, VALG, k);

  hs.registrerFremgang("skann");
  assert.equal(await hs.slaa(), true);
  assert.ok(await lager.les(VALG.nokkel));
});

test("EN FROSSEN LØKKE STANSER PULSEN — dette er hele poenget", async () => {
  // En tidsdrevet ping ville fortsatt sendt puls her, fordi event-loopen er
  // frisk og timeren fyrer som normalt. Fremgangsdrevet puls gjør det ikke.
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  const hs = new Hjerteslag(lager, VALG, k);

  hs.registrerFremgang("skann");
  assert.equal(await hs.slaa(), true, "frisk løkke skal pulse");

  // Løkken henger i en await som aldri løses. Tiden går, men ingen fremgang.
  k.gaa(VALG.stillstandsgrenseMs + 1);

  assert.equal(await hs.slaa(), false, "en frossen løkke skal ikke pulse");
  assert.equal(hs.bilde().friskt, false);

  // Og pulsen utløper, slik at vaktbikkja ser døden.
  k.gaa(VALG.pulsTtlMs);
  assert.equal(await lager.les(VALG.nokkel), null);
});

test("tomgang er fremgang — en rolig time dreper ikke et friskt system", async () => {
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  const hs = new Hjerteslag(lager, VALG, k);

  // Løkken skanner og finner ingenting, gjentatte ganger, i to timer.
  for (let i = 0; i < 24; i++) {
    k.gaa(5 * 60_000);
    hs.registrerFremgang("tomgang");
    assert.equal(await hs.slaa(), true, `tomgangsrunde ${i} skal pulse`);
  }
});

test("hjerteslaget avviser en konfigurasjon der pulsen utløper mellom to slag", () => {
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  assert.throws(
    () => new Hjerteslag(lager, { ...VALG, pulsTtlMs: VALG.intervallMs }, k),
    /pulsTtlMs/,
  );
  assert.throws(
    () => new Hjerteslag(lager, { ...VALG, stillstandsgrenseMs: 1 }, k),
    /stillstandsgrenseMs/,
  );
});

test("vakt registrerer fremgang når steget lykkes", async () => {
  const k = new Testklokke();
  const hs = new Hjerteslag(new MinnePuls(k), VALG, k);
  const foer = hs.bilde().sekvens;

  const svar = await hs.vakt("steg", 1_000, async () => 42);

  assert.equal(svar, 42);
  assert.equal(hs.bilde().sekvens, foer + 1);
  assert.equal(hs.bilde().sisteSteg, "steg");
});

test("vakt gjør en hengende await til en Frist-feil i stedet for stillstand", async () => {
  const k = new Testklokke();
  const hs = new Hjerteslag(new MinnePuls(k), VALG, k);

  await assert.rejects(
    () => hs.vakt("hengende-api", 20, () => new Promise(() => {})),
    (feil: unknown) => feil instanceof Frist && feil.steg === "hengende-api",
  );
  // Ingen fremgang registrert — det er slik en løkke som bare henger til slutt
  // slutter å pulse.
  assert.equal(hs.bilde().sisteSteg, "oppstart");
});

test("vakt gir arbeidet et avbruddssignal så tilkoblinger frigjøres", async () => {
  const k = new Testklokke();
  const hs = new Hjerteslag(new MinnePuls(k), VALG, k);
  let avbrutt = false;

  await assert.rejects(() =>
    hs.vakt("api", 20, (signal) => {
      signal.addEventListener("abort", () => {
        avbrutt = true;
      });
      return new Promise(() => {});
    }),
  );
  assert.equal(avbrutt, true, "signalet skal ha blitt utløst ved fristen");
});

// ------------------------------------------------------------------- vaktbikkje

class Tellende implements Drapsmann {
  drap: string[] = [];
  async drep(arsak: string): Promise<void> {
    this.drap.push(arsak);
  }
}

const VAKTVALG = {
  nokkel: "feniks:puls",
  naadetidMs: 15 * 60_000,
  maksOmstarterPerVindu: 3,
  vinduMs: 60 * 60_000,
};

test("vaktbikkja lar et friskt system være i fred", async () => {
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  const drapsmann = new Tellende();
  const hs = new Hjerteslag(lager, VALG, k);
  const vb = new Vaktbikkje(lager, drapsmann, VAKTVALG, undefined, k);

  hs.registrerFremgang("skann");
  await hs.slaa();

  const rapport = await vb.sjekk();
  assert.equal(rapport.status, "frisk");
  assert.equal(drapsmann.drap.length, 0);
});

test("vaktbikkja dreper når pulsen er utløpt", async () => {
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  const drapsmann = new Tellende();
  const vb = new Vaktbikkje(lager, drapsmann, VAKTVALG, undefined, k);

  const rapport = await vb.sjekk();
  assert.equal(rapport.status, "drepte");
  assert.equal(drapsmann.drap.length, 1);
  assert.match(drapsmann.drap[0]!, /ikke gjort fremgang/);
});

test("vaktbikkja venter på den nye instansens første puls før den dreper igjen", async () => {
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  const drapsmann = new Tellende();
  const vb = new Vaktbikkje(lager, drapsmann, VAKTVALG, undefined, k);

  await vb.sjekk();
  assert.equal(drapsmann.drap.length, 1);

  // Umiddelbart etterpå: ikke drep igjen, containeren starter fortsatt opp.
  k.gaa(60_000);
  const rapport = await vb.sjekk();
  assert.equal(rapport.status, "venter");
  assert.equal(drapsmann.drap.length, 1);
});

test("vaktbikkja går i karantene framfor å hamre på en kilde hele natten", async () => {
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  const drapsmann = new Tellende();
  const vb = new Vaktbikkje(lager, drapsmann, VAKTVALG, undefined, k);

  // Tre omstarter, med nok tid mellom hver til at nådetiden er ute.
  for (let i = 0; i < 3; i++) {
    const r = await vb.sjekk();
    assert.equal(r.status, "drepte", `omstart ${i} skulle skjedd`);
    k.gaa(VAKTVALG.naadetidMs + 1);
  }
  assert.equal(drapsmann.drap.length, 3);

  // Fjerde runde: budsjettet er brukt opp.
  const rapport = await vb.sjekk();
  assert.equal(rapport.status, "karantene");
  assert.equal(drapsmann.drap.length, 3, "ingen fjerde omstart");

  // Karantenen holder.
  k.gaa(10 * 60_000);
  assert.equal((await vb.sjekk()).status, "karantene");
});

test("karantenen krever et menneske for å løftes", async () => {
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  const drapsmann = new Tellende();
  const vb = new Vaktbikkje(lager, drapsmann, VAKTVALG, undefined, k);

  for (let i = 0; i < 3; i++) {
    await vb.sjekk();
    k.gaa(VAKTVALG.naadetidMs + 1);
  }
  await vb.sjekk();
  assert.equal((await vb.sjekk()).status, "karantene");

  vb.frigi();
  const etter = await vb.sjekk();
  assert.equal(etter.status, "drepte", "etter frigivelse skal den virke igjen");
});

test("omstartsbudsjettet er et glidende vindu, ikke en engangskvote", async () => {
  const k = new Testklokke();
  const lager = new MinnePuls(k);
  const drapsmann = new Tellende();
  const vb = new Vaktbikkje(lager, drapsmann, VAKTVALG, undefined, k);

  for (let i = 0; i < 2; i++) {
    await vb.sjekk();
    k.gaa(VAKTVALG.naadetidMs + 1);
  }
  assert.equal(drapsmann.drap.length, 2);

  // La vinduet gå ut: de gamle omstartene skal ikke lenger telle.
  k.gaa(VAKTVALG.vinduMs + 1);
  for (let i = 0; i < 3; i++) {
    const r = await vb.sjekk();
    assert.equal(r.status, "drepte");
    k.gaa(VAKTVALG.naadetidMs + 1);
  }
  assert.equal(drapsmann.drap.length, 5);
});

test("DockerDrapsmann i tørrkjøring rører ingenting", async () => {
  let kjort = false;
  const d = new DockerDrapsmann("feniks-master", true, undefined, async () => {
    kjort = true;
  });
  await d.drep("test");
  assert.equal(kjort, false);
});

test("DockerDrapsmann bevæpnet starter containeren på nytt", async () => {
  const kommandoer: string[][] = [];
  const d = new DockerDrapsmann("feniks-master", false, undefined, async (k, a) => {
    kommandoer.push([k, ...a]);
  });
  await d.drep("test");
  assert.deepEqual(kommandoer, [["docker", "restart", "--time", "10", "feniks-master"]]);
});

test("DockerDrapsmann krever et containernavn", () => {
  assert.throws(() => new DockerDrapsmann("", true));
});

// --------------------------------------------------------------------- FilPuls

test("FilPuls overlever på tvers av instanser og respekterer levetid", async () => {
  const katalog = await mkdtemp(join(tmpdir(), "feniks-puls-"));
  try {
    const k = new Testklokke();
    const skriver = new FilPuls(katalog, () => k.na());
    const leser = new FilPuls(katalog, () => k.na());

    await skriver.skriv("feniks:puls", "levende", 10_000);
    assert.equal(await leser.les("feniks:puls"), "levende");

    k.gaa(10_001);
    assert.equal(await leser.les("feniks:puls"), null, "pulsen skal ha utløpt");
  } finally {
    await rm(katalog, { recursive: true, force: true });
  }
});

test("FilPuls behandler manglende og korrupt fil som ingen puls", async () => {
  const katalog = await mkdtemp(join(tmpdir(), "feniks-puls-"));
  try {
    const p = new FilPuls(katalog);
    assert.equal(await p.les("finnes:ikke"), null);
  } finally {
    await rm(katalog, { recursive: true, force: true });
  }
});
