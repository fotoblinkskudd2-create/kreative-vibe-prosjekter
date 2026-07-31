import { daysBetween } from './dates';
import { ruleFor } from './merchants';
import type { Cadence, Recurring, Transaction } from './types';

const CADENCES: Array<{ name: Cadence; days: number; tolerance: number }> = [
  { name: 'ukentlig', days: 7, tolerance: 2 },
  { name: 'månedlig', days: 30.44, tolerance: 6 },
  { name: 'kvartalsvis', days: 91.3, tolerance: 12 },
  { name: 'halvårlig', days: 182.6, tolerance: 20 },
  { name: 'årlig', days: 365.25, tolerance: 30 },
];

const DAYS_PER_MONTH = 30.44;

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Finner faste trekk: samme brukersted, jevnt mellomrom, stabilt beløp.
 * Krever minst tre trekk, eller to hvis brukerstedet er en kjent abonnementstjeneste.
 */
export function detectRecurring(transactions: Transaction[]): Recurring[] {
  const outgoing = transactions.filter((t) => t.amount < 0);
  const groups = new Map<string, Transaction[]>();
  for (const t of outgoing) {
    const list = groups.get(t.merchant);
    if (list) list.push(t);
    else groups.set(t.merchant, [t]);
  }

  const result: Recurring[] = [];

  for (const [merchant, group] of groups) {
    const known = ruleFor(merchant)?.subscription === true;
    const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
    const dedup = collapseSameDay(sorted);
    const minCount = known ? 2 : 3;
    if (dedup.length < minCount) continue;

    const amounts = dedup.map((t) => Math.abs(t.amount));
    const typicalAmount = median(amounts);
    if (typicalAmount < 1000) continue; // under 10 kr — ikke verdt å rapportere

    const gaps: number[] = [];
    for (let i = 1; i < dedup.length; i++) {
      gaps.push(daysBetween(dedup[i - 1].date, dedup[i].date));
    }
    const medianGap = median(gaps);
    if (medianGap < 4) continue; // daglige kjøp er ikke abonnement

    const cadence = classifyCadence(medianGap);
    if (!cadence) continue;

    const spread = amountSpread(amounts, typicalAmount);
    // Faste trekk har stabile beløp. Litt slingringsmonn for prisjusteringer.
    const stable = spread <= (known ? 0.5 : 0.25);
    if (!stable) continue;

    const gapConsistency = consistency(gaps, cadence.days, cadence.tolerance);
    if (gapConsistency < 0.5 && !known) continue;

    const monthlyCost = Math.round((typicalAmount * DAYS_PER_MONTH) / cadence.days);
    const first = amounts.slice(0, Math.max(1, Math.floor(amounts.length / 3)));
    const last = amounts.slice(-Math.max(1, Math.floor(amounts.length / 3)));
    const firstAvg = median(first);
    const lastAvg = median(last);
    const priceIncrease =
      firstAvg > 0 && lastAvg > firstAvg * 1.05 ? (lastAvg - firstAvg) / firstAvg : null;

    result.push({
      merchant,
      merchantLabel: dedup[0].merchantLabel,
      category: dedup[0].category,
      cadence: cadence.name,
      typicalAmount,
      monthlyCost,
      count: dedup.length,
      firstDate: dedup[0].date,
      lastDate: dedup[dedup.length - 1].date,
      confidence: Math.min(
        1,
        gapConsistency * 0.6 + (1 - Math.min(spread, 1)) * 0.25 + (known ? 0.15 : 0.05),
      ),
      priceIncrease,
      transactions: dedup,
    });
  }

  return result.sort((a, b) => b.monthlyCost - a.monthlyCost);
}

/** Slår sammen flere trekk samme dag fra samme sted (delbetalinger, gebyrlinjer). */
function collapseSameDay(sorted: Transaction[]): Transaction[] {
  const out: Transaction[] = [];
  for (const t of sorted) {
    const prev = out[out.length - 1];
    if (prev && prev.date === t.date) {
      out[out.length - 1] = { ...prev, amount: prev.amount + t.amount };
    } else {
      out.push(t);
    }
  }
  return out;
}

function classifyCadence(medianGap: number) {
  let best: (typeof CADENCES)[number] | null = null;
  let bestDiff = Infinity;
  for (const c of CADENCES) {
    const diff = Math.abs(medianGap - c.days);
    if (diff <= c.tolerance && diff < bestDiff) {
      best = c;
      bestDiff = diff;
    }
  }
  return best;
}

/** Relativt avvik i beløp: 0 = alle trekk identiske. */
function amountSpread(amounts: number[], typical: number): number {
  if (typical === 0) return 1;
  const deviations = amounts.map((a) => Math.abs(a - typical) / typical);
  return median(deviations) * 0.5 + Math.max(...deviations) * 0.5;
}

/** Andel av mellomrommene som treffer forventet intervall. */
function consistency(gaps: number[], expected: number, tolerance: number): number {
  if (gaps.length === 0) return 0;
  const hits = gaps.filter((g) => Math.abs(g - expected) <= tolerance).length;
  return hits / gaps.length;
}
