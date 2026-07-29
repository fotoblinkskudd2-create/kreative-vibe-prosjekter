/**
 * Ratebudsjett — token bucket per kilde.
 *
 * Poenget er ikke å komme så nær grensen som mulig. Poenget er å aldri treffe
 * den. En 429 er ikke en gratis retry: mange tjenester teller avviste
 * forespørsler mot deg, og gjentatte 429-er er nøyaktig signalet som utløser en
 * varig sperre. Budsjettet holdes derfor bevisst under den publiserte grensen.
 *
 * Bøtta refylles kontinuerlig, ikke i vindussprang. Vindusbasert telling gir
 * «thundering herd» på vindusgrensen — alle forespørsler samles i det
 * øyeblikket vinduet nullstilles, og det ser ut som et angrep.
 */

import type { Klokke } from "../kjerne/typer.ts";

export interface BudsjettValg {
  /** Kildens publiserte grense, forespørsler per periode. */
  readonly grensePerPeriode: number;
  readonly periodeMs: number;
  /**
   * Andel av grensen vi tillater oss å bruke, 0–1. 0,8 gir 20 % luft til
   * retries, klokkeavvik og at kilden teller litt annerledes enn oss.
   */
  readonly utnyttelse: number;
  /**
   * Hvor mange forespørsler som kan tas ut på én gang. Lav burst gir jevnere
   * trafikk; en jevn strøm ser mindre ut som en bot enn en sagtann gjør.
   */
  readonly burst: number;
}

export class Ratebudsjett {
  private tokens: number;
  private sistFylt: number;
  /** Tokens per millisekund. */
  private readonly rate: number;
  private readonly kapasitet: number;

  constructor(
    private readonly navn: string,
    valg: BudsjettValg,
    private readonly klokke: Klokke = { na: () => Date.now() },
  ) {
    if (valg.grensePerPeriode <= 0) throw new Error(`${navn}: grensen må være positiv`);
    if (valg.periodeMs <= 0) throw new Error(`${navn}: perioden må være positiv`);
    if (valg.utnyttelse <= 0 || valg.utnyttelse > 1) {
      throw new Error(`${navn}: utnyttelse må ligge i (0, 1], fikk ${valg.utnyttelse}`);
    }
    if (valg.burst < 1) throw new Error(`${navn}: burst må være minst 1`);

    this.rate = (valg.grensePerPeriode * valg.utnyttelse) / valg.periodeMs;
    this.kapasitet = valg.burst;
    this.tokens = valg.burst;
    this.sistFylt = this.klokke.na();
  }

  private fyll(): void {
    const na = this.klokke.na();
    const gaatt = na - this.sistFylt;
    if (gaatt <= 0) return;
    this.tokens = Math.min(this.kapasitet, this.tokens + gaatt * this.rate);
    this.sistFylt = na;
  }

  /** Prøv å ta ett token. Returnerer false uten å blokkere hvis tomt. */
  prov(): boolean {
    this.fyll();
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }

  /** Millisekunder til neste token er tilgjengelig. 0 hvis klar nå. */
  ventetidMs(): number {
    this.fyll();
    if (this.tokens >= 1) return 0;
    return Math.ceil((1 - this.tokens) / this.rate);
  }

  /**
   * Registrer at kilden svarte 429 eller sendte et rate-limit-varsel. Vi
   * tømmer bøtta: kilden har nettopp fortalt oss at vår modell av grensen er
   * feil, og da er det vår modell som skal vike, ikke kildens.
   */
  strupet(): void {
    this.fyll();
    this.tokens = 0;
  }

  get kilde(): string {
    return this.navn;
  }

  /** Tokens tilgjengelig nå. For metrikker. */
  get igjen(): number {
    this.fyll();
    return this.tokens;
  }
}
