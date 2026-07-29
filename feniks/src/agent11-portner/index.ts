/**
 * Agent 11 — Portneren (datatilgang og oppetid).
 *
 * Erstatter den opprinnelig spesifiserte «Skyggen». Funksjonen er den samme
 * problemstillingen — Agent 3 (Researcheren) skal ha en uavbrutt datastrøm — men
 * midlet er invertert. Der Skyggen skulle skjule seg, identifiserer Portneren
 * seg: fast User-Agent med kontaktpunkt, én stabil IP, avtalte kvoter.
 *
 * Grunnen er ikke forsiktighet. Det er levetid. Et system bygget på unnvikelse
 * har korrelert feil — når fingeravtrykk-metoden oppdages, dør alle kilder i
 * samme time, midt i en syklus, med kapital bundet i åpne posisjoner. Et system
 * bygget på kvoter degraderes i stedet: en kilde blir treg, kretsbryteren tar
 * den ut, de andre kildene kjører videre, og Orkestratoren vet det.
 *
 * «Nedetid er uakseptabelt» er derfor beholdt som krav, men oppnås gjennom
 * caching, kretsbrytere og eksplisitt degradering — ikke gjennom å ikke bli
 * oppdaget.
 */

import type { Klokke } from "../kjerne/typer.ts";

import { stilleLogg, type Logg } from "../kjerne/logg.ts";
import { planlegg, retrybar, type BackoffValg, type Svarstatus, STANDARD_BACKOFF } from "./backoff.ts";
import { Cache } from "./cache.ts";
import { KildeAvvist, apneKilde, type Kilde } from "./kilder.ts";
import { Kretsbryter, STANDARD_BRYTER, type BryterValg } from "./kretsbryter.ts";
import { Ratebudsjett } from "./ratebudsjett.ts";

/** Rå HTTP, injisert slik at Portneren kan testes uten nettverk. */
export interface Henter {
  utfor(forespoersel: Forespoersel): Promise<RaSvar>;
}

export interface Forespoersel {
  readonly url: string;
  readonly hoder: Readonly<Record<string, string>>;
}

export interface RaSvar {
  readonly kode: number;
  readonly kropp: string;
  readonly hoder: Readonly<Record<string, string>>;
}

export type PortnerSvar<T> =
  | { readonly ok: true; readonly data: T; readonly fraCache: boolean }
  /**
   * Forventet, ikke-eksepsjonell utilgjengelighet. Orkestratoren skal fortsette
   * på andre kilder og prøve denne igjen etter `ventMs`.
   */
  | { readonly ok: false; readonly arsak: string; readonly ventMs: number };

export interface PortnerValg {
  /**
   * Identifikasjon sendt i User-Agent. Skal inneholde et kontaktpunkt. Dette er
   * ikke en formalitet: en identifiserbar klient med en e-postadresse blir
   * kontaktet når den er til bry, mens en uidentifisert klient blir sperret.
   */
  readonly identifikasjon: string;
  readonly backoff: BackoffValg;
  readonly bryter: BryterValg;
  /** Utnyttelsesgrad av publisert kvote, 0–1. */
  readonly kvoteutnyttelse: number;
  readonly burst: number;
}

export const STANDARD_PORTNER: PortnerValg = Object.freeze({
  identifikasjon: "Feniks/1.0 (+kontakt: sett FENIKS_KONTAKT)",
  backoff: STANDARD_BACKOFF,
  bryter: STANDARD_BRYTER,
  kvoteutnyttelse: 0.8,
  burst: 4,
});

interface Sluse {
  readonly kilde: Kilde;
  readonly budsjett: Ratebudsjett;
  readonly bryter: Kretsbryter;
}

export class Portner {
  private readonly sluser = new Map<string, Sluse>();
  private readonly cache: Cache<unknown>;

  constructor(
    private readonly henter: Henter,
    private readonly valg: PortnerValg = STANDARD_PORTNER,
    private readonly logg: Logg = stilleLogg,
    private readonly klokke: Klokke = { na: () => Date.now() },
    private readonly env: Record<string, string | undefined> = process.env,
  ) {
    this.cache = new Cache<unknown>(10_000, klokke);
  }

  /**
   * Registrer en kilde. Kaster `KildeAvvist` når kilden ikke har lovlig vei
   * eller mangler legitimasjon — det er en konfigurasjonsfeil som skal stoppe
   * oppstart, ikke degraderes i drift.
   */
  registrer(navn: string): void {
    if (this.sluser.has(navn)) return;
    const kilde = apneKilde(navn, this.env);
    if (!kilde.kvote) {
      throw new KildeAvvist(navn, "kilden mangler kvotedefinisjon; kan ikke rate-budsjetteres");
    }
    this.sluser.set(navn, {
      kilde,
      budsjett: new Ratebudsjett(
        navn,
        {
          grensePerPeriode: kilde.kvote.kall,
          periodeMs: kilde.kvote.periodeMs,
          utnyttelse: this.valg.kvoteutnyttelse,
          burst: this.valg.burst,
        },
        this.klokke,
      ),
      bryter: new Kretsbryter(navn, this.valg.bryter, this.klokke),
    });
    this.logg.info("kilde registrert", {
      kilde: navn,
      kvoteKall: kilde.kvote.kall,
      kvotePeriodeMs: kilde.kvote.periodeMs,
      cacheTakMs: kilde.cacheTakMs,
    });
  }

  private hoder(kilde: Kilde, etag?: string): Record<string, string> {
    const kontakt = this.env.FENIKS_KONTAKT;
    const h: Record<string, string> = {
      "user-agent": kontakt
        ? `Feniks/1.0 (+kontakt: ${kontakt})`
        : this.valg.identifikasjon,
      accept: "application/json",
    };
    if (etag) h["if-none-match"] = etag;
    if (kilde.autentisering === "oauth2-bearer") {
      const token = this.env.X_BEARER_TOKEN;
      if (token) h.authorization = `Bearer ${token}`;
    }
    return h;
  }

  /**
   * Hent en ressurs. Rekkefølgen er bevisst: cache før kvote, kvote før
   * kretsbryter, kretsbryter før nettverk. Et ferskt cachetreff skal aldri
   * koste et token.
   */
  async hent<T>(kildenavn: string, sti: string, ttlMs?: number): Promise<PortnerSvar<T>> {
    const sluse = this.sluser.get(kildenavn);
    if (!sluse) {
      return { ok: false, arsak: `kilden «${kildenavn}» er ikke registrert`, ventMs: 0 };
    }
    const logg = this.logg.med({ kilde: kildenavn, sti });
    const nokkel = `${kildenavn}:${sti}`;
    const levetid = Math.min(ttlMs ?? sluse.kilde.cacheTakMs, sluse.kilde.cacheTakMs);

    const treff = this.cache.slaaOpp(nokkel);
    if (treff.status === "fersk") {
      return { ok: true, data: treff.verdi as T, fraCache: true };
    }

    if (!sluse.bryter.slipperGjennom()) {
      const ventMs = sluse.bryter.ventetidMs();
      // Utløpt cache er bedre enn ingen data når kilden er ute.
      if (treff.status === "utloept") {
        logg.varsel("kretsbryter åpen, bruker utløpt cache", { ventMs });
        return { ok: true, data: treff.verdi as T, fraCache: true };
      }
      return { ok: false, arsak: `kretsbryter åpen for ${kildenavn}`, ventMs };
    }

    if (!sluse.budsjett.prov()) {
      const ventMs = sluse.budsjett.ventetidMs();
      if (treff.status === "utloept") {
        logg.debug("kvote oppbrukt, bruker utløpt cache", { ventMs });
        return { ok: true, data: treff.verdi as T, fraCache: true };
      }
      return { ok: false, arsak: `kvote oppbrukt for ${kildenavn}`, ventMs };
    }

    const url = `${sluse.kilde.base}${sti}`;
    const etag = treff.status === "utloept" ? treff.etag : undefined;

    let svar: RaSvar;
    try {
      svar = await this.henter.utfor({ url, hoder: this.hoder(sluse.kilde, etag) });
    } catch (feil) {
      sluse.bryter.feilet();
      logg.varsel("nettverksfeil", { feil });
      if (treff.status === "utloept") {
        return { ok: true, data: treff.verdi as T, fraCache: true };
      }
      return { ok: false, arsak: "nettverksfeil", ventMs: sluse.bryter.ventetidMs() };
    }

    // 304: cachen var riktig, bare utdatert i vår bokføring.
    if (svar.kode === 304 && treff.status === "utloept") {
      sluse.bryter.lykkes();
      this.cache.revalider(nokkel, levetid);
      return { ok: true, data: treff.verdi as T, fraCache: true };
    }

    if (svar.kode >= 200 && svar.kode < 300) {
      sluse.bryter.lykkes();
      let data: T;
      try {
        data = JSON.parse(svar.kropp) as T;
      } catch {
        sluse.bryter.feilet();
        return { ok: false, arsak: "ugyldig JSON fra kilden", ventMs: 0 };
      }
      this.cache.lagre(nokkel, data, levetid, svar.hoder.etag);
      return { ok: true, data, fraCache: false };
    }

    // Feilsvar. 429 og 403 behandles ulikt: det første er struping, det andre
    // er at noe er galt med legitimasjonen eller forespørselen.
    const status: Svarstatus = {
      kode: svar.kode,
      retryAfterSek: lesRetryAfter(svar.hoder),
    };

    if (svar.kode === 429) {
      sluse.budsjett.strupet();
      const pause = (status.retryAfterSek ?? 60) * 1000;
      sluse.bryter.tvingAapen(pause);
      logg.varsel("strupet av kilden — senk kvoteutnyttelsen", {
        retryAfterSek: status.retryAfterSek,
      });
    } else if (svar.kode === 403 || svar.kode === 401) {
      // Ikke gjenta. Dette er en konfigurasjonsfeil, og gjentakelse gjør skade.
      sluse.bryter.tvingAapen(this.valg.bryter.maksPauseMs);
      logg.feil("avvist av kilden — sjekk legitimasjon og vilkår", { kode: svar.kode });
    } else {
      sluse.bryter.feilet();
    }

    if (treff.status === "utloept") {
      return { ok: true, data: treff.verdi as T, fraCache: true };
    }

    const plan = retrybar(status) === "gjenta" ? planlegg(status, 0, this.valg.backoff) : null;
    return {
      ok: false,
      arsak: `kilden svarte ${svar.kode}`,
      ventMs: plan?.ventMs ?? sluse.bryter.ventetidMs(),
    };
  }

  /** Helsebilde for Orkestratoren. Grunnlag for degradert drift. */
  helse(): readonly { kilde: string; bryter: string; tokensIgjen: number }[] {
    return [...this.sluser.values()].map((s) => ({
      kilde: s.kilde.navn,
      bryter: s.bryter.status,
      tokensIgjen: Math.floor(s.budsjett.igjen),
    }));
  }

  /** Er minst én kilde i stand til å svare? Ellers har løkken ingen input. */
  harLevendeKilde(): boolean {
    return [...this.sluser.values()].some((s) => s.bryter.status !== "aapen");
  }
}

function lesRetryAfter(hoder: Readonly<Record<string, string>>): number | undefined {
  const rå = hoder["retry-after"];
  if (!rå) return undefined;
  const sek = Number(rå);
  if (Number.isFinite(sek) && sek >= 0) return sek;
  const tid = Date.parse(rå);
  if (Number.isNaN(tid)) return undefined;
  return Math.max(0, Math.ceil((tid - Date.now()) / 1000));
}

export * from "./backoff.ts";
export * from "./cache.ts";
export * from "./kilder.ts";
export * from "./kretsbryter.ts";
export * from "./ratebudsjett.ts";
