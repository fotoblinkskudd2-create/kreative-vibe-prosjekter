import { useRef, useState } from 'react';

interface Props {
  busy: boolean;
  onFile: (file: File) => void;
  onText: (text: string) => void;
  onDemo: () => void;
}

export function Upload({ busy, onFile, onText, onDemo }: Props) {
  const [over, setOver] = useState(false);
  const [pasted, setPasted] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="card">
      <h2>1. Last opp bankutskrift</h2>
      <p>
        CSV fra nettbanken din. Filen leses i nettleseren og sendes ingen steder — appen har
        ingen server å sende den til.
      </p>

      <div
        className={`drop${over ? ' over' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        style={{ marginTop: 14 }}
      >
        <strong>Slipp CSV-filen her</strong>
        <span className="muted small">eller trykk for å velge fil</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt,.tsv,text/csv,text/plain"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />

      <details>
        <summary>Har du bare PDF? Lim inn transaksjonslinjene her</summary>
        <p className="small" style={{ margin: '10px 0' }}>
          Åpne PDF-en, merk transaksjonene, kopier og lim inn under. Appen finner dato,
          tekst og beløp i hver linje.
        </p>
        <textarea
          value={pasted}
          spellCheck={false}
          placeholder={'31.01.2025  NETFLIX.COM AMSTERDAM   -179,00\n30.01.2025  REMA 1000 TOYEN   -412,50'}
          onChange={(e) => setPasted(e.target.value)}
        />
        <button
          className="btn ghost"
          disabled={busy || pasted.trim().length < 10}
          onClick={() => onText(pasted)}
        >
          Skann innlimt tekst
        </button>
      </details>

      <button className="btn" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? (
          <>
            <span className="spinner" />
            Skanner …
          </>
        ) : (
          'VELG FIL OG KJØR SKANN'
        )}
      </button>
      <button className="btn quiet" disabled={busy} onClick={onDemo}>
        Prøv med demodata (120 dager, oppdiktet person)
      </button>
    </section>
  );
}
