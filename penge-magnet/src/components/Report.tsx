import { formatNo } from '../lib/dates';
import { CATEGORY_LABEL } from '../lib/labels';
import { kr } from '../lib/money';
import type { HistoryEntry } from '../lib/storage';
import type { Category, FixState, ScanResult } from '../lib/types';

interface Props {
  result: ScanResult;
  fixes: FixState;
  history: HistoryEntry[];
}

export function Report({ result, fixes, history }: Props) {
  const done = result.leaks.filter((l) => fixes.status[l.id] === 'gjort');
  const ignored = result.leaks.filter((l) => fixes.status[l.id] === 'ignorert');
  const open = result.leaks.filter((l) => (fixes.status[l.id] ?? 'åpen') === 'åpen');

  const saved = done.reduce((acc, l) => acc + l.monthlySaving, 0);
  const remaining = open.reduce((acc, l) => acc + l.monthlySaving, 0);
  const possible = saved + remaining;
  const share = possible > 0 ? Math.round((saved / possible) * 100) : 0;

  const monthlyOut = result.totalOut / Math.max(result.months, 1);
  const byCategory = spendByCategory(result);

  return (
    <>
      <section className="card hero">
        <h2>Spart så langt</h2>
        <div className="big">{kr(saved)}/mnd</div>
        <div className="sub">
          {kr(saved * 12)} i året · {done.length} av {result.leaks.length} lekkasjer fikset
        </div>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${share}%` }} />
        </div>
        <p className="small" style={{ marginTop: 8 }}>
          {remaining > 0
            ? `${kr(remaining)}/mnd ligger fortsatt igjen på bordet.`
            : 'Alt du har funnet er fikset. Skann på nytt om en måned og se etter nye trekk.'}
        </p>
      </section>

      <section className="card">
        <h2>Månedsbildet</h2>
        <div className="grid">
          <div className="stat">
            <div className="k">Ut per måned</div>
            <div className="v">{kr(Math.round(monthlyOut))}</div>
          </div>
          <div className="stat">
            <div className="k">Inn per måned</div>
            <div className="v">{kr(Math.round(result.totalIn / Math.max(result.months, 1)))}</div>
          </div>
          <div className="stat">
            <div className="k">Lekkasje av forbruket</div>
            <div className="v">
              {monthlyOut > 0 ? Math.round((possible / monthlyOut) * 100) : 0} %
            </div>
          </div>
          <div className="stat">
            <div className="k">Analysert periode</div>
            <div className="v">{result.months} mnd</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Kategori</th>
              <th className="num">Per måned</th>
              <th className="num">Andel</th>
            </tr>
          </thead>
          <tbody>
            {byCategory.map(([category, amount]) => (
              <tr key={category}>
                <td>{CATEGORY_LABEL[category]}</td>
                <td className="num">{kr(Math.round(amount / Math.max(result.months, 1)))}</td>
                <td className="num muted">
                  {result.totalOut > 0 ? Math.round((amount / result.totalOut) * 100) : 0} %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {done.length > 0 && (
        <section className="card">
          <h2>Fikset</h2>
          <ul className="plain">
            {done.map((l) => (
              <li key={l.id}>
                {l.title} — <span className="amount">{kr(l.monthlySaving)}/mnd</span>
                {fixes.doneAt[l.id] && (
                  <span className="muted small"> · {formatNo(fixes.doneAt[l.id].slice(0, 10))}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {ignored.length > 0 && (
        <section className="card">
          <h2>Lagt til side</h2>
          <ul className="plain muted">
            {ignored.map((l) => (
              <li key={l.id}>{l.title}</li>
            ))}
          </ul>
        </section>
      )}

      {history.length > 1 && (
        <section className="card">
          <h2>Tidligere skanninger</h2>
          <table>
            <thead>
              <tr>
                <th>Dato</th>
                <th className="num">Funn</th>
                <th className="num">Lekkasje</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((h, i) => (
                <tr key={`${h.at}-${i}`}>
                  <td>{formatNo(h.at.slice(0, 10))}</td>
                  <td className="num">{h.leakCount}</td>
                  <td className="num">{kr(h.monthlySaving)}/mnd</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small" style={{ marginTop: 10 }}>
            Går tallet ned mellom skanningene, virker tiltakene. Historikken ligger bare i denne
            nettleseren.
          </p>
        </section>
      )}
    </>
  );
}

function spendByCategory(result: ScanResult): Array<[Category, number]> {
  const totals = new Map<Category, number>();
  for (const t of result.transactions) {
    if (t.amount >= 0) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}
