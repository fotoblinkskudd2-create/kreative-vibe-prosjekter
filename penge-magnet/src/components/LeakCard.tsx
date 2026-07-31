import { useState } from 'react';
import { mailtoLink } from '../lib/fixes';
import { kr } from '../lib/money';
import type { Leak } from '../lib/types';

interface Props {
  leak: Leak;
  status: 'åpen' | 'gjort' | 'ignorert';
  onStatus: (status: 'åpen' | 'gjort' | 'ignorert') => void;
}

const KIND_LABEL: Record<Leak['action']['kind'], string> = {
  kanseller: 'Si opp',
  bytt: 'Bytt / reforhandle',
  vane: 'Endre vane',
  sjekk: 'Sjekk selv',
};

export function LeakCard({ leak, status, onStatus }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    const email = leak.action.email;
    if (!email) return;
    const text = `Emne: ${email.subject}\n\n${email.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      className={`card leak${status === 'gjort' ? ' done' : ''}${
        status === 'ignorert' ? ' ignored' : ''
      }`}
    >
      <div>
        <span className="tag hot">{KIND_LABEL[leak.action.kind]}</span>
        <span className={`tag${leak.certainty === 'estimat' ? ' warn' : ''}`}>
          {leak.certainty === 'sikker' ? 'Tall fra utskriften' : 'Anslag'}
        </span>
        {status === 'gjort' && <span className="tag">Fikset</span>}
      </div>

      <h3>{leak.title}</h3>
      <p>{leak.why}</p>

      <div className="grid">
        <div className="stat">
          <div className="k">Koster i dag</div>
          <div className="v">{kr(leak.monthlyCost)}/mnd</div>
        </div>
        <div className="stat">
          <div className="k">Du kan spare</div>
          <div className="v amount">{kr(leak.monthlySaving)}/mnd</div>
        </div>
        <div className="stat">
          <div className="k">Per år</div>
          <div className="v amount">{kr(leak.monthlySaving * 12)}</div>
        </div>
      </div>

      <h4 style={{ marginTop: 16, fontSize: 14 }}>{leak.action.label}</h4>
      <ol className="steps">
        {leak.action.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      {leak.action.email && (
        <details>
          <summary>Ferdig oppsigelse — du leser gjennom og sender selv</summary>
          <pre className="email">
            {`Til: ${leak.action.email.to ?? '(finn kundeservice hos leverandøren)'}
Emne: ${leak.action.email.subject}

${leak.action.email.body}`}
          </pre>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn small ghost" onClick={copyEmail}>
              {copied ? 'Kopiert' : 'Kopier tekst'}
            </button>
            <a
              className="btn small ghost"
              style={{ textDecoration: 'none', display: 'inline-block' }}
              href={mailtoLink(leak.action.email)}
            >
              Åpne i e-postklient
            </a>
          </div>
        </details>
      )}

      <details>
        <summary>Grunnlaget ({leak.evidence.length} linjer fra utskriften)</summary>
        <ul className="plain small" style={{ marginTop: 8 }}>
          {leak.evidence.map((e, i) => (
            <li key={i} className="muted">
              {e}
            </li>
          ))}
        </ul>
      </details>

      <div className="row" style={{ marginTop: 14 }}>
        <button
          className={`btn small${status === 'gjort' ? ' quiet' : ''}`}
          onClick={() => onStatus(status === 'gjort' ? 'åpen' : 'gjort')}
        >
          {status === 'gjort' ? 'Angre' : 'Marker som fikset'}
        </button>
        <button
          className="btn small quiet"
          onClick={() => onStatus(status === 'ignorert' ? 'åpen' : 'ignorert')}
        >
          {status === 'ignorert' ? 'Ta inn igjen' : 'Ikke aktuelt'}
        </button>
      </div>
    </article>
  );
}
