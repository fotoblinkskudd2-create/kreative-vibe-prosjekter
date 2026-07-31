import { decodeBytes, parseCsv } from './csv';
import { parseDate } from './dates';
import { parseAmount } from './money';
import { identifyMerchant } from './merchants';
import type { Transaction } from './types';

export interface ParsedStatement {
  transactions: Transaction[];
  warnings: string[];
  /** Hvilke kolonner vi endte opp med å bruke — vises i grensesnittet */
  mapping: { date: string; text: string; amount: string };
}

const DATE_HEADERS = [
  'bokfringsdato',
  'bokfort',
  'bokforingsdato',
  'dato',
  'transaksjonsdato',
  'rentedato',
  'valutadato',
  'date',
  'utfrt dato',
];

const TEXT_HEADERS = [
  'beskrivelse',
  'tekst',
  'forklaring',
  'melding',
  'transaksjonstekst',
  'brukersted',
  'mottaker',
  'motkonto',
  'description',
  'text',
  'narrative',
  'type',
];

const AMOUNT_HEADERS = ['belop', 'bel p', 'amount', 'sum', 'transaksjonsbelop'];
const OUT_HEADERS = ['ut fra konto', 'uttak', 'belastning', 'debet', 'ut', 'withdrawal'];
const IN_HEADERS = ['inn pa konto', 'innskudd', 'kreditt', 'kredit', 'inn', 'deposit'];

function norm(h: string): string {
  return h
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findHeader(headers: string[], candidates: string[]): number {
  const normed = headers.map(norm);
  for (const c of candidates) {
    const exact = normed.indexOf(c);
    if (exact >= 0) return exact;
  }
  for (const c of candidates) {
    const partial = normed.findIndex((h) => h.includes(c));
    if (partial >= 0) return partial;
  }
  return -1;
}

/** Finner raden som ser ut som en header. Banker legger ofte kontoinfo på toppen. */
function findHeaderRow(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i];
    if (row.length < 2) continue;
    const hasDate = findHeader(row, DATE_HEADERS) >= 0;
    const hasAmount =
      findHeader(row, AMOUNT_HEADERS) >= 0 ||
      findHeader(row, OUT_HEADERS) >= 0 ||
      findHeader(row, IN_HEADERS) >= 0;
    if (hasDate && hasAmount) return i;
  }
  return -1;
}

export function parseStatementText(text: string): ParsedStatement {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return emptyResult(['Fant ingen rader i filen.']);
  }

  const headerRow = findHeaderRow(rows);
  return headerRow >= 0
    ? parseWithHeader(rows, headerRow)
    : parseWithoutHeader(rows);
}

function emptyResult(warnings: string[]): ParsedStatement {
  return { transactions: [], warnings, mapping: { date: '-', text: '-', amount: '-' } };
}

function parseWithHeader(rows: string[][], headerIdx: number): ParsedStatement {
  const headers = rows[headerIdx];
  const warnings: string[] = [];

  const dateIdx = findHeader(headers, DATE_HEADERS);
  const amountIdx = findHeader(headers, AMOUNT_HEADERS);
  const outIdx = findHeader(headers, OUT_HEADERS);
  const inIdx = findHeader(headers, IN_HEADERS);
  const textIdxs = [
    ...new Set(TEXT_HEADERS.map((h) => findHeader(headers, [h])).filter((i) => i >= 0)),
  ].sort((a, b) => a - b);
  const textIdx = textIdxs.length > 0 ? textIdxs[0] : -1;

  if (dateIdx < 0) return emptyResult(['Fant ingen datokolonne i filen.']);
  if (amountIdx < 0 && outIdx < 0 && inIdx < 0) {
    return emptyResult(['Fant ingen beløpskolonne i filen.']);
  }

  const transactions: Transaction[] = [];
  let skipped = 0;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const date = parseDate(row[dateIdx] ?? '');
    if (!date) {
      if ((row[dateIdx] ?? '').trim() !== '') skipped++;
      continue;
    }

    let amount: number | null = null;
    if (amountIdx >= 0) {
      amount = parseAmount(row[amountIdx] ?? '');
    }
    if (amount == null && outIdx >= 0) {
      const out = parseAmount(row[outIdx] ?? '');
      if (out != null && out !== 0) amount = -Math.abs(out);
    }
    if (amount == null && inIdx >= 0) {
      const inn = parseAmount(row[inIdx] ?? '');
      if (inn != null && inn !== 0) amount = Math.abs(inn);
    }
    if (amount == null || amount === 0) {
      skipped++;
      continue;
    }

    // Slå sammen alle tekstkolonner slik at "brukersted" og "type" begge teller.
    const textParts = textIdxs.length
      ? textIdxs.map((idx) => row[idx] ?? '')
      : [row.find((c, idx) => idx !== dateIdx && !/^[\d\s.,+-]+$/.test(c) && c) ?? ''];
    const text = textParts.filter(Boolean).join(' ').trim() || 'Ukjent transaksjon';

    transactions.push(buildTransaction(date, text, amount, i));
  }

  if (skipped > 0) {
    warnings.push(`${skipped} rader ble hoppet over (manglet gyldig dato eller beløp).`);
  }
  if (transactions.length === 0) {
    warnings.push('Fant ingen transaksjoner. Sjekk at filen er en kontoutskrift.');
  }

  return {
    transactions,
    warnings,
    mapping: {
      date: headers[dateIdx] ?? '?',
      text: textIdx >= 0 ? headers[textIdx] ?? '?' : 'autodetektert',
      amount:
        amountIdx >= 0
          ? headers[amountIdx] ?? '?'
          : [outIdx, inIdx].filter((i) => i >= 0).map((i) => headers[i]).join(' / '),
    },
  };
}

/**
 * Fallback for utskrifter uten header — typisk tekst limt inn fra PDF.
 * Vi leter etter en dato i starten og et beløp på slutten av hver linje.
 */
function parseWithoutHeader(rows: string[][]): ParsedStatement {
  const transactions: Transaction[] = [];
  let skipped = 0;

  rows.forEach((row, i) => {
    const line = row.join(' ').trim();
    const parsed = parseFreeformLine(line);
    if (!parsed) {
      skipped++;
      return;
    }
    transactions.push(buildTransaction(parsed.date, parsed.text, parsed.amount, i));
  });

  const warnings: string[] = [];
  if (transactions.length === 0) {
    warnings.push(
      'Klarte ikke å tolke filen. Forventet kolonneoverskrifter som "Dato" og "Beløp".',
    );
  } else if (skipped > 0) {
    warnings.push(`${skipped} linjer uten dato/beløp ble hoppet over.`);
  }

  return {
    transactions,
    warnings,
    mapping: { date: 'autodetektert', text: 'autodetektert', amount: 'autodetektert' },
  };
}

const AMOUNT_TOKEN = /-?\(?\d{1,3}(?:[ ., ]\d{3})*(?:[.,]\d{2})?\)?-?$/;

export function parseFreeformLine(
  line: string,
): { date: string; text: string; amount: number } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const dateMatch = /^\s*(\d{1,4}[-./]\d{1,2}[-./]\d{2,4})/.exec(trimmed);
  if (!dateMatch) return null;
  const date = parseDate(dateMatch[1]);
  if (!date) return null;

  let rest = trimmed.slice(dateMatch[0].length).trim();
  // Fjern en eventuell ekstra dato (rentedato/valutadato).
  const secondDate = /^(\d{1,4}[-./]\d{1,2}[-./]\d{2,4})\s+/.exec(rest);
  if (secondDate) rest = rest.slice(secondDate[0].length).trim();

  const tokens = rest.split(/\s{2,}|\t| (?=-?\(?\d)/);
  // Finn siste token som ser ut som et beløp.
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i].trim();
    if (!token) continue;
    if (!AMOUNT_TOKEN.test(token)) continue;
    const amount = parseAmount(token.replace(/(\d)-$/, '-$1'));
    if (amount == null || amount === 0) continue;
    const text = tokens.slice(0, i).join(' ').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    return { date, text, amount };
  }
  return null;
}

function buildTransaction(
  date: string,
  text: string,
  amount: number,
  seq: number,
): Transaction {
  const merchant = identifyMerchant(text);
  return {
    id: `${date}-${seq}-${Math.abs(amount)}`,
    date,
    text,
    merchant: merchant.key,
    merchantLabel: merchant.label,
    amount,
    category: merchant.category,
  };
}

export async function parseStatementFile(file: File): Promise<ParsedStatement> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) {
    return emptyResult([
      'PDF støttes ikke direkte ennå. Åpne PDF-en, kopier transaksjonslinjene og lim dem inn i tekstfeltet under — eller last ned CSV fra nettbanken.',
    ]);
  }
  const bytes = await file.arrayBuffer();
  const text = decodeBytes(bytes);
  return parseStatementText(text);
}
