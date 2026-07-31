import { formatNo } from '../lib/dates';
import { kr } from '../lib/money';
import type { Recurring } from '../lib/types';

export function RecurringTable({ recurring }: { recurring: Recurring[] }) {
  if (recurring.length === 0) {
    return (
      <section className="card">
        <h2>Faste trekk</h2>
        <p>
          Fant ingen faste trekk. Det krever minst to–tre trekk fra samme sted med jevnt
          mellomrom — last opp en lengre periode hvis du vet at du har abonnementer.
        </p>
      </section>
    );
  }

  const total = recurring.reduce((acc, s) => acc + s.monthlyCost, 0);

  return (
    <section className="card">
      <h2>Faste trekk ({recurring.length})</h2>
      <p>
        Alt appen mener går automatisk hver måned. Til sammen{' '}
        <span className="amount">{kr(total)}/mnd</span> — {kr(total * 12)} i året.
      </p>

      <table>
        <thead>
          <tr>
            <th>Hvem</th>
            <th>Hvor ofte</th>
            <th className="num">Per trekk</th>
            <th className="num">Per måned</th>
            <th className="num">Sist</th>
          </tr>
        </thead>
        <tbody>
          {recurring.map((s) => (
            <tr key={s.merchant}>
              <td>
                {s.merchantLabel}
                {s.priceIncrease != null && (
                  <span className="tag warn" style={{ marginLeft: 8 }}>
                    +{Math.round(s.priceIncrease * 100)} %
                  </span>
                )}
                {s.confidence < 0.7 && (
                  <span className="tag warn" style={{ marginLeft: 8 }}>
                    usikker
                  </span>
                )}
              </td>
              <td className="muted">
                {s.cadence} · {s.count} trekk
              </td>
              <td className="num">{kr(s.typicalAmount)}</td>
              <td className="num amount">{kr(s.monthlyCost)}</td>
              <td className="num muted">{formatNo(s.lastDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
