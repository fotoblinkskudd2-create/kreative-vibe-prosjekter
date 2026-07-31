export type Category =
  | 'abonnement'
  | 'mat'
  | 'takeaway'
  | 'transport'
  | 'bolig'
  | 'forsikring'
  | 'gebyr'
  | 'shopping'
  | 'trening'
  | 'spill'
  | 'alkohol_tobakk'
  | 'helse'
  | 'inntekt'
  | 'sparing'
  | 'overforing'
  | 'kontanter'
  | 'ukjent';

export interface Transaction {
  id: string;
  /** ISO-dato, YYYY-MM-DD */
  date: string;
  /** Original tekst fra banken */
  text: string;
  /** Normalisert brukersted, f.eks. "netflix" */
  merchant: string;
  /** Visningsnavn, f.eks. "Netflix" */
  merchantLabel: string;
  /** Øre. Negativt = penger ut. */
  amount: number;
  category: Category;
}

export type Cadence = 'ukentlig' | 'månedlig' | 'kvartalsvis' | 'halvårlig' | 'årlig';

export interface Recurring {
  merchant: string;
  merchantLabel: string;
  category: Category;
  cadence: Cadence;
  /** Typisk beløp per trekk, i øre (positivt tall) */
  typicalAmount: number;
  /** Normalisert til kroner per måned, i øre (positivt tall) */
  monthlyCost: number;
  count: number;
  firstDate: string;
  lastDate: string;
  /** 0-1 */
  confidence: number;
  /** Beløpet har økt siden første trekk (andel, f.eks. 0.18 = 18 %) */
  priceIncrease: number | null;
  transactions: Transaction[];
}

export type ActionKind = 'kanseller' | 'bytt' | 'vane' | 'sjekk';

export interface Leak {
  id: string;
  title: string;
  /** Hvorfor dette er en lekkasje, i klartekst */
  why: string;
  category: Category;
  /** Faktisk kostnad i dag, øre per måned */
  monthlyCost: number;
  /** Realistisk besparelse, øre per måned */
  monthlySaving: number;
  /** 'sikker' = tallet kommer rett fra utskriften, 'estimat' = anslag */
  certainty: 'sikker' | 'estimat';
  action: {
    kind: ActionKind;
    label: string;
    steps: string[];
    /** Ferdig kanselleringsepost, hvis relevant */
    email?: { to: string | null; subject: string; body: string };
  };
  evidence: string[];
  /**
   * Brukersteder denne lekkasjen "eier". To regler kan treffe samme abonnement,
   * og da skal bare den største telle — ellers spares samme krone to ganger.
   */
  claims?: string[];
}

export interface ScanResult {
  transactions: Transaction[];
  recurring: Recurring[];
  leaks: Leak[];
  periodStart: string;
  periodEnd: string;
  months: number;
  totalOut: number;
  totalIn: number;
  monthlySaving: number;
  warnings: string[];
}

export interface FixState {
  /** leak.id -> status */
  status: Record<string, 'åpen' | 'gjort' | 'ignorert'>;
  /** leak.id -> ISO-tidspunkt da den ble markert gjort */
  doneAt: Record<string, string>;
}
