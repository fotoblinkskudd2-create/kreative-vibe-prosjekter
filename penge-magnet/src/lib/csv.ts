/** Minimal, robust CSV-leser. Ingen avhengigheter — filen forlater aldri maskinen. */

export type Delimiter = ';' | ',' | '\t' | '|';

const CANDIDATES: Delimiter[] = [';', ',', '\t', '|'];

/**
 * Dekoder filbytes. Norske banker eksporterer ofte windows-1252 eller ISO-8859-1,
 * så vi prøver streng UTF-8 først og faller tilbake når den feiler.
 */
export function decodeBytes(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  // Fjern BOM.
  const body =
    view[0] === 0xef && view[1] === 0xbb && view[2] === 0xbf ? view.subarray(3) : view;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(body);
  } catch {
    return new TextDecoder('windows-1252').decode(body);
  }
}

/** Gjetter skilletegn ved å telle forekomster utenfor anførselstegn, per linje. */
export function sniffDelimiter(text: string): Delimiter {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '').slice(0, 20);
  if (lines.length === 0) return ';';

  let best: Delimiter = ';';
  let bestScore = -1;

  for (const d of CANDIDATES) {
    const counts = lines.map((line) => countOutsideQuotes(line, d));
    const nonZero = counts.filter((c) => c > 0);
    if (nonZero.length === 0) continue;
    // Konsistent antall kolonner er et sterkt signal.
    const mode = counts.sort((a, b) => a - b)[Math.floor(counts.length / 2)];
    const consistent = counts.filter((c) => c === mode).length;
    const score = mode * 10 + consistent;
    if (mode > 0 && score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

function countOutsideQuotes(line: string, delimiter: string): number {
  let inQuotes = false;
  let count = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') i++;
      else inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      count++;
    }
  }
  return count;
}

/** Parser CSV til rader. Støtter anførselstegn, doble anførselstegn og linjeskift i felt. */
export function parseCsv(text: string, delimiter?: Delimiter): string[][] {
  const d = delimiter ?? sniffDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === d) {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch === '\r') {
      // Ignorer; \n håndterer radslutt.
    } else {
      field += ch;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows
    .map((r) => r.map((c) => c.trim()))
    .filter((r) => r.some((c) => c !== ''));
}
