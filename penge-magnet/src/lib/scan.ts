import { findLeaks, monthsCovered } from './leaks';
import { detectRecurring } from './recurring';
import type { ScanResult, Transaction } from './types';

/** Kjører hele analysen på et sett transaksjoner. Ingenting av dette rører nettverket. */
export function analyze(transactions: Transaction[], warnings: string[] = []): ScanResult {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const months = monthsCovered(sorted);
  const recurring = detectRecurring(sorted);
  const leaks = findLeaks(sorted, recurring, months);

  const totalOut = sorted
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalIn = sorted.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);

  const allWarnings = [...warnings];
  if (months < 2 && sorted.length > 0) {
    allWarnings.push(
      'Utskriften dekker under to måneder. Faste trekk er vanskeligere å oppdage — last opp 90 dager for best resultat.',
    );
  }

  return {
    transactions: sorted,
    recurring,
    leaks,
    periodStart: sorted[0]?.date ?? '',
    periodEnd: sorted[sorted.length - 1]?.date ?? '',
    months: Math.round(months * 10) / 10,
    totalOut,
    totalIn,
    monthlySaving: leaks.reduce((acc, l) => acc + l.monthlySaving, 0),
    warnings: allWarnings,
  };
}
