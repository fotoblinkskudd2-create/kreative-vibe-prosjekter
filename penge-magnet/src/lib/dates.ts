/** Datotolking for norske bankutskrifter. Returnerer alltid ISO (YYYY-MM-DD). */

const PATTERNS: Array<{ re: RegExp; order: 'dmy' | 'ymd' }> = [
  { re: /^(\d{4})-(\d{2})-(\d{2})/, order: 'ymd' },
  { re: /^(\d{4})\.(\d{2})\.(\d{2})/, order: 'ymd' },
  { re: /^(\d{4})\/(\d{2})\/(\d{2})/, order: 'ymd' },
  { re: /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/, order: 'dmy' },
  { re: /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, order: 'dmy' },
  { re: /^(\d{1,2})-(\d{1,2})-(\d{2,4})/, order: 'dmy' },
];

export function parseDate(raw: string): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // Kompakt format uten skilletegn: 20250131
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
  if (compact) return build(+compact[1], +compact[2], +compact[3]);

  for (const { re, order } of PATTERNS) {
    const m = re.exec(s);
    if (!m) continue;
    if (order === 'ymd') return build(+m[1], +m[2], +m[3]);
    const year = normalizeYear(+m[3]);
    return build(year, +m[2], +m[1]);
  }
  return null;
}

function normalizeYear(y: number): number {
  if (y >= 1000) return y;
  return y < 70 ? 2000 + y : 1900 + y;
}

function build(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  if (y < 1990 || y > 2100) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function addDays(iso: string, days: number): string {
  const dt = new Date(`${iso}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function formatNo(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
