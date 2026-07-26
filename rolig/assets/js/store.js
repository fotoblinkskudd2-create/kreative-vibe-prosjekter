/* Lokal lagring – alt blir liggende på enheten, ingenting sendes noe sted. */

const KEY_CHECKINS = 'rolig.v1.checkins';
const KEY_ACTIONS = 'rolig.v1.actions';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Full disk eller privat modus – appen skal fortsatt fungere.
    return false;
  }
}

/** Dato som lokal nøkkel, f.eks. «2026-07-26». */
export function dayKey(date = new Date()) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/* ------------------------------------------------------------- Innsjekk - */

export const MOODS = [
  { id: 1, emoji: '😔', label: 'Veldig tungt' },
  { id: 2, emoji: '🙁', label: 'Tungt' },
  { id: 3, emoji: '😐', label: 'Midt imellom' },
  { id: 4, emoji: '🙂', label: 'Ganske greit' },
  { id: 5, emoji: '😌', label: 'Lett' }
];

export function moodById(id) {
  return MOODS.find((m) => m.id === Number(id)) || null;
}

/** Alle innsjekk, nyeste først. */
export function getCheckins() {
  const list = read(KEY_CHECKINS, []);
  return Array.isArray(list) ? list.slice().sort((a, b) => b.at - a.at) : [];
}

export function addCheckin({ mood, note }) {
  const list = read(KEY_CHECKINS, []);
  const entry = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    day: dayKey(),
    mood: Number(mood),
    note: (note || '').trim()
  };
  list.push(entry);
  write(KEY_CHECKINS, list);
  return entry;
}

/* ------------------------------------------------------------ Små grep -- */

/** { '2026-07-26': ['frisk-luft', 'vann'] } */
export function getDoneToday() {
  const all = read(KEY_ACTIONS, {});
  return new Set(all[dayKey()] || []);
}

export function toggleActionDone(actionId) {
  const all = read(KEY_ACTIONS, {});
  const key = dayKey();
  const today = new Set(all[key] || []);
  today.has(actionId) ? today.delete(actionId) : today.add(actionId);
  all[key] = [...today];
  write(KEY_ACTIONS, all);
  return today.has(actionId);
}

/* ------------------------------------------------------------ Oversikt -- */

/** Antall dager de siste 7 dagene med minst ett innsjekk eller ett lite grep. */
export function careCountThisWeek() {
  const cutoff = Date.now() - 6 * 24 * 60 * 60 * 1000;
  const days = new Set();

  for (const c of getCheckins()) {
    if (c.at >= cutoff) days.add(c.day);
  }

  const actions = read(KEY_ACTIONS, {});
  for (const [day, ids] of Object.entries(actions)) {
    if (!ids || ids.length === 0) continue;
    const t = new Date(`${day}T12:00:00`).getTime();
    if (!Number.isNaN(t) && t >= cutoff) days.add(day);
  }

  return days.size;
}
