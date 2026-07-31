import { useCallback, useEffect, useMemo, useState } from 'react';
import { LeakCard } from './components/LeakCard';
import { RecurringTable } from './components/RecurringTable';
import { Report } from './components/Report';
import { Upload } from './components/Upload';
import { formatNo } from './lib/dates';
import { demoCsv } from './lib/demo';
import { kr } from './lib/money';
import { buildPlanText, downloadText } from './lib/plan';
import { analyze } from './lib/scan';
import { parseStatementFile, parseStatementText } from './lib/statement';
import {
  clearAll,
  emptyFixState,
  loadFixes,
  loadHistory,
  pushHistory,
  saveFixes,
  type HistoryEntry,
} from './lib/storage';
import type { FixState, ScanResult } from './lib/types';

type Tab = 'skann' | 'lekkasjer' | 'faste' | 'rapport';

export default function App() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('skann');
  const [fixes, setFixes] = useState<FixState>(emptyFixState);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    setFixes(loadFixes());
    setHistory(loadHistory());
  }, []);

  const runScan = useCallback(
    async (load: () => Promise<{ transactions: ScanResult['transactions']; warnings: string[] }>, label: string) => {
      setBusy(true);
      setError(null);
      try {
        const parsed = await load();
        if (parsed.transactions.length === 0) {
          setError(
            parsed.warnings[0] ??
              'Fant ingen transaksjoner i filen. Last ned kontoutskrift som CSV fra nettbanken og prøv igjen.',
          );
          setResult(null);
          return;
        }
        const scan = analyze(parsed.transactions, parsed.warnings);
        setResult(scan);
        setSource(label);
        setTab('lekkasjer');
        setHistory(
          pushHistory({
            at: new Date().toISOString(),
            monthlySaving: scan.monthlySaving,
            leakCount: scan.leaks.length,
            transactionCount: scan.transactions.length,
          }),
        );
      } catch (e) {
        setError(
          `Klarte ikke å lese filen: ${e instanceof Error ? e.message : 'ukjent feil'}. Prøv en CSV-eksport fra nettbanken.`,
        );
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const setStatus = useCallback((id: string, status: 'åpen' | 'gjort' | 'ignorert') => {
    setFixes((prev) => {
      const next: FixState = {
        status: { ...prev.status, [id]: status },
        doneAt: { ...prev.doneAt },
      };
      if (status === 'gjort') next.doneAt[id] = new Date().toISOString();
      else delete next.doneAt[id];
      saveFixes(next);
      return next;
    });
  }, []);

  const openLeaks = useMemo(
    () => result?.leaks.filter((l) => (fixes.status[l.id] ?? 'åpen') === 'åpen') ?? [],
    [result, fixes],
  );
  const openSaving = openLeaks.reduce((acc, l) => acc + l.monthlySaving, 0);
  const doneSaving =
    result?.leaks
      .filter((l) => fixes.status[l.id] === 'gjort')
      .reduce((acc, l) => acc + l.monthlySaving, 0) ?? 0;

  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <h1>⚡ PENGE-MAGNET</h1>
          <p>Skanner utskriften. Finner lekkasjene. Gir deg en plan du kan gjennomføre i dag.</p>
          <nav className="tabs" role="tablist" aria-label="Seksjoner">
            {(
              [
                ['skann', 'Skann'],
                ['lekkasjer', `Lekkasjer${result ? ` (${result.leaks.length})` : ''}`],
                ['faste', `Faste trekk${result ? ` (${result.recurring.length})` : ''}`],
                ['rapport', 'Rapport'],
              ] as Array<[Tab, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                className="tab"
                aria-selected={tab === id}
                disabled={id !== 'skann' && !result}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="wrap">
        {error && (
          <div className="warn-box" role="alert">
            {error}
          </div>
        )}

        {tab === 'skann' && (
          <>
            <Upload
              busy={busy}
              onFile={(file) =>
                runScan(async () => await parseStatementFile(file), file.name)
              }
              onText={(text) => runScan(async () => parseStatementText(text), 'innlimt tekst')}
              onDemo={() =>
                runScan(async () => parseStatementText(demoCsv()), 'demodata')
              }
            />

            <section className="card">
              <h2>Slik fungerer den</h2>
              <ol className="steps">
                <li>
                  <b>Import.</b> Leser dato, tekst og beløp fra utskriften. Takler norske
                  tallformat, semikolon, ISO-datoer og æøå.
                </li>
                <li>
                  <b>Gjenkjenning.</b> Kobler hver linje til et brukersted og en kategori, og
                  finner faste trekk ved å se etter jevne mellomrom og stabile beløp.
                </li>
                <li>
                  <b>Lekkasjeregler.</b> Overlappende abonnementer, stille prisøkninger, gebyrer,
                  takeaway-mønstre, dyre strømavtaler og småkjøp.
                </li>
                <li>
                  <b>Plan.</b> Hver lekkasje får konkrete steg — og en ferdig oppsigelse du selv
                  leser gjennom og sender.
                </li>
                <li>
                  <b>Oppfølging.</b> Kryss av det du har gjort. Skann på nytt neste måned og se om
                  trekkene faktisk stoppet.
                </li>
              </ol>
            </section>

            <section className="card">
              <h2>Sikkerhet</h2>
              <ul className="plain">
                <li>
                  <b>Ingenting sendes ut.</b> Appen har ingen backend. Filen leses i nettleseren,
                  og siden blokkerer utgående nettverkskall i sin egen sikkerhetspolicy.
                </li>
                <li>
                  <b>Ingen bankinnlogging.</b> Den ber aldri om BankID eller passord, og kan ikke
                  flytte penger.
                </li>
                <li>
                  <b>Du sender selv.</b> «Fiks alt» skriver oppsigelsene — du leser gjennom og
                  trykker send.
                </li>
                <li>
                  <b>Bare avkryssinger lagres.</b> Hvilke lekkasjer du har fikset ligger i denne
                  nettleseren. Transaksjonene lagres aldri.
                </li>
              </ul>
              <button
                className="btn quiet"
                onClick={() => {
                  clearAll();
                  setFixes(emptyFixState);
                  setHistory([]);
                  setResult(null);
                  setTab('skann');
                }}
              >
                Slett alt appen har lagret
              </button>
            </section>
          </>
        )}

        {tab === 'lekkasjer' && result && (
          <>
            <section className="card hero">
              <h2>Total lekkasje funnet</h2>
              <div className="big">{kr(result.monthlySaving)}/mnd</div>
              <div className="sub">
                {kr(result.monthlySaving * 12)} i året · {result.leaks.length} funn ·{' '}
                {result.transactions.length} transaksjoner fra {formatNo(result.periodStart)} til{' '}
                {formatNo(result.periodEnd)}
                {source && ` · kilde: ${source}`}
              </div>
              <div className="grid">
                <div className="stat">
                  <div className="k">Gjenstår</div>
                  <div className="v amount">{kr(openSaving)}/mnd</div>
                </div>
                <div className="stat">
                  <div className="k">Allerede fikset</div>
                  <div className="v">{kr(doneSaving)}/mnd</div>
                </div>
                <div className="stat">
                  <div className="k">Faste trekk funnet</div>
                  <div className="v">{result.recurring.length}</div>
                </div>
              </div>
              <button
                className="btn"
                onClick={() =>
                  downloadText(
                    `pengemagnet-fiksplan-${new Date().toISOString().slice(0, 10)}.txt`,
                    buildPlanText(result, fixes),
                  )
                }
              >
                FIKS ALT: LAST NED HELE PLANEN MED FERDIGE OPPSIGELSER
              </button>
              <p className="small" style={{ marginTop: 8 }}>
                Du får én tekstfil med alle stegene i rekkefølge og ferdig skrevne oppsigelser.
                Appen sender ingenting selv.
              </p>
            </section>

            {result.warnings.map((w, i) => (
              <div className="warn-box" key={i}>
                {w}
              </div>
            ))}

            {result.leaks.length === 0 && (
              <section className="card">
                <h3>Ingen tydelige lekkasjer</h3>
                <p>
                  Appen fant ingen overlappende abonnementer, gebyrer eller mønstre som slår ut på
                  terskelverdiene. Sjekk «Faste trekk» — der ligger alt som går automatisk hver
                  måned, og de er verdt en gjennomgang uansett.
                </p>
              </section>
            )}

            {result.leaks.map((leak) => (
              <LeakCard
                key={leak.id}
                leak={leak}
                status={fixes.status[leak.id] ?? 'åpen'}
                onStatus={(s) => setStatus(leak.id, s)}
              />
            ))}
          </>
        )}

        {tab === 'faste' && result && <RecurringTable recurring={result.recurring} />}

        {tab === 'rapport' && result && (
          <Report result={result} fixes={fixes} history={history} />
        )}

        <footer className="note">
          Penge-Magnet 1.0 · Alt regnes ut lokalt. Anslag er merket som anslag — tall hentet rett
          fra utskriften er merket som sikre. Appen gir ikke finansiell rådgivning, og du bør
          sjekke oppsigelsestid og bindingstid før du sier opp noe.
        </footer>
      </main>
    </>
  );
}
