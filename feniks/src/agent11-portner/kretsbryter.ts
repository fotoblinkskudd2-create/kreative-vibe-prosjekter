/**
 * Kretsbryter per kilde.
 *
 * Når en kilde begynner å feile, er det verste systemet kan gjøre å fortsette å
 * hamre på den. Det er både årsaken til at midlertidige sperrer blir varige, og
 * årsaken til at en enkelt død kilde henger hele løkken.
 *
 * Tre tilstander:
 *   LUKKET   — normal drift, feil telles.
 *   ÅPEN     — kilden er tatt ut. Kall avvises umiddelbart, uten nettverk.
 *   HALVÅPEN — én prøveforespørsel slippes gjennom. Lykkes den, lukkes bryteren;
 *              feiler den, åpnes den igjen med lengre pause.
 *
 * Merk at ÅPEN er en *funksjon*, ikke en feiltilstand: Orkestratoren skal kunne
 * kjøre videre på de kildene som virker. Det er derfor `Portner` returnerer et
 * eksplisitt «kilde utilgjengelig»-utfall i stedet for å kaste.
 */

import type { Klokke } from "../kjerne/typer.ts";

export type Tilstand = "lukket" | "aapen" | "halvaapen";

export interface BryterValg {
  /** Antall sammenhengende feil som åpner bryteren. */
  readonly feilterskel: number;
  /** Hvor lenge bryteren står åpen før første prøveforespørsel. */
  readonly pauseMs: number;
  /**
   * Maksimal pause. Hver gang en prøveforespørsel feiler, dobles pausen opp til
   * dette taket — en kilde som avviser oss gjentatte ganger skal spørres
   * sjeldnere, ikke like ofte.
   */
  readonly maksPauseMs: number;
}

export const STANDARD_BRYTER: BryterValg = Object.freeze({
  feilterskel: 5,
  pauseMs: 30_000,
  maksPauseMs: 15 * 60_000,
});

export class Kretsbryter {
  private tilstand: Tilstand = "lukket";
  private feil = 0;
  private aapnetVed = 0;
  private gjeldendePauseMs: number;

  constructor(
    private readonly navn: string,
    private readonly valg: BryterValg = STANDARD_BRYTER,
    private readonly klokke: Klokke = { na: () => Date.now() },
  ) {
    if (valg.feilterskel < 1) throw new Error(`${navn}: feilterskel må være minst 1`);
    if (valg.pauseMs <= 0) throw new Error(`${navn}: pausen må være positiv`);
    if (valg.maksPauseMs < valg.pauseMs) {
      throw new Error(`${navn}: maksPauseMs kan ikke være lavere enn pauseMs`);
    }
    this.gjeldendePauseMs = valg.pauseMs;
  }

  /** Kan et kall slippes gjennom nå? Oppdaterer tilstand som sideeffekt. */
  slipperGjennom(): boolean {
    if (this.tilstand === "lukket") return true;
    if (this.tilstand === "halvaapen") return false; // prøvekallet er allerede ute
    if (this.klokke.na() - this.aapnetVed >= this.gjeldendePauseMs) {
      this.tilstand = "halvaapen";
      return true;
    }
    return false;
  }

  lykkes(): void {
    this.feil = 0;
    this.tilstand = "lukket";
    this.gjeldendePauseMs = this.valg.pauseMs;
  }

  feilet(): void {
    if (this.tilstand === "halvaapen") {
      // Prøvekallet feilet: tilbake til åpen, med dobbelt pause.
      this.gjeldendePauseMs = Math.min(this.gjeldendePauseMs * 2, this.valg.maksPauseMs);
      this.tilstand = "aapen";
      this.aapnetVed = this.klokke.na();
      return;
    }
    this.feil += 1;
    if (this.feil >= this.valg.feilterskel) {
      this.tilstand = "aapen";
      this.aapnetVed = this.klokke.na();
    }
  }

  /**
   * Tving bryteren åpen med en gitt pause. Brukes når kilden sender et
   * eksplisitt signal — 429 med lang `Retry-After`, eller 403 som antyder at
   * nøkkelen er sperret. Da skal vi ikke vente på at feilterskelen fylles.
   */
  tvingAapen(pauseMs: number): void {
    this.tilstand = "aapen";
    this.aapnetVed = this.klokke.na();
    this.gjeldendePauseMs = Math.min(Math.max(pauseMs, this.valg.pauseMs), this.valg.maksPauseMs);
  }

  get status(): Tilstand {
    return this.tilstand;
  }

  get kilde(): string {
    return this.navn;
  }

  /** Millisekunder til bryteren slipper gjennom igjen. 0 hvis åpen for kall. */
  ventetidMs(): number {
    if (this.tilstand === "lukket") return 0;
    if (this.tilstand === "halvaapen") return 0;
    const igjen = this.gjeldendePauseMs - (this.klokke.na() - this.aapnetVed);
    return igjen > 0 ? igjen : 0;
  }
}
