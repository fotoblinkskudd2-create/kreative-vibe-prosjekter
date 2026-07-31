import type { FixState } from './types';

const KEY_FIXES = 'pengemagnet.fixes.v1';
const KEY_HISTORY = 'pengemagnet.history.v1';

export interface HistoryEntry {
  /** ISO-tidspunkt for skanningen */
  at: string;
  monthlySaving: number;
  leakCount: number;
  transactionCount: number;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Full lagring eller privat modus — appen fungerer fint uten historikk.
  }
}

export const emptyFixState: FixState = { status: {}, doneAt: {} };

export function loadFixes(): FixState {
  const state = read<FixState>(KEY_FIXES, emptyFixState);
  return { status: state.status ?? {}, doneAt: state.doneAt ?? {} };
}

export function saveFixes(state: FixState): void {
  write(KEY_FIXES, state);
}

export function loadHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(KEY_HISTORY, []);
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const history = [...loadHistory(), entry].slice(-24);
  write(KEY_HISTORY, history);
  return history;
}

export function clearAll(): void {
  try {
    localStorage.removeItem(KEY_FIXES);
    localStorage.removeItem(KEY_HISTORY);
  } catch {
    // ignorer
  }
}
