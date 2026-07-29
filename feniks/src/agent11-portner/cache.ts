/**
 * TTL-cache med ETag-støtte.
 *
 * Caching er den eneste mekanismen som gjør en kvotebegrenset kilde til en
 * kontinuerlig datastrøm. Et 6-timers cachetak på eBay gjør 5 000 kall per dag
 * til noe som dekker et katalogutvalg langt større enn 5 000 rader.
 *
 * `etag` lagres slik at et utløpt treff kan revalideres med
 * `If-None-Match`. Et 304-svar koster kvote, men lite båndbredde — og noen
 * kilder teller ikke 304 mot kvoten i det hele tatt.
 */

import type { Klokke } from "../kjerne/typer.ts";

interface Post<T> {
  readonly verdi: T;
  readonly utloper: number;
  readonly etag?: string | undefined;
  /** For LRU-utkasting. */
  sistBrukt: number;
}

export type Treff<T> =
  | { readonly status: "fersk"; readonly verdi: T }
  | { readonly status: "utloept"; readonly verdi: T; readonly etag?: string | undefined }
  | { readonly status: "tomt" };

export class Cache<T> {
  private readonly poster = new Map<string, Post<T>>();

  constructor(
    private readonly maksPoster = 10_000,
    private readonly klokke: Klokke = { na: () => Date.now() },
  ) {
    if (maksPoster < 1) throw new Error("maksPoster må være minst 1");
  }

  slaaOpp(nokkel: string): Treff<T> {
    const post = this.poster.get(nokkel);
    if (!post) return { status: "tomt" };
    const na = this.klokke.na();
    post.sistBrukt = na;
    if (na < post.utloper) return { status: "fersk", verdi: post.verdi };
    return { status: "utloept", verdi: post.verdi, etag: post.etag };
  }

  lagre(nokkel: string, verdi: T, ttlMs: number, etag?: string): void {
    if (ttlMs <= 0) return; // kilden tillater ikke lagring
    const na = this.klokke.na();
    if (this.poster.size >= this.maksPoster && !this.poster.has(nokkel)) {
      this.kastEldste();
    }
    this.poster.set(nokkel, { verdi, utloper: na + ttlMs, etag, sistBrukt: na });
  }

  /** Forleng en utløpt post etter et 304-svar. */
  revalider(nokkel: string, ttlMs: number): boolean {
    const post = this.poster.get(nokkel);
    if (!post) return false;
    const na = this.klokke.na();
    this.poster.set(nokkel, { ...post, utloper: na + ttlMs, sistBrukt: na });
    return true;
  }

  private kastEldste(): void {
    let eldsteNokkel: string | null = null;
    let eldsteTid = Infinity;
    for (const [nokkel, post] of this.poster) {
      if (post.sistBrukt < eldsteTid) {
        eldsteTid = post.sistBrukt;
        eldsteNokkel = nokkel;
      }
    }
    if (eldsteNokkel !== null) this.poster.delete(eldsteNokkel);
  }

  get antall(): number {
    return this.poster.size;
  }

  tom(): void {
    this.poster.clear();
  }
}
