/** Beløp håndteres som hele øre (heltall) for å unngå flyttallsfeil. */

const SPACE_CHARS = /[\s   ]/g;

/**
 * Tolker et beløp fra en bankutskrift.
 * Takler: "1 234,56", "1.234,56", "1,234.56", "-1234", "1 234,56 kr", "(1 234,56)".
 * Returnerer øre, eller null hvis strengen ikke er et beløp.
 */
export function parseAmount(raw: string): number | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;

  // Regnskapsnotasjon: (1 234,56) betyr negativt.
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }

  s = s.replace(/(?:kr|nok)\.?/gi, '');
  s = s.replace(SPACE_CHARS, '');
  s = s.replace(/−/g, '-'); // unicode minus

  if (s.startsWith('-')) {
    negative = !negative;
    s = s.slice(1);
  } else if (s.startsWith('+')) {
    s = s.slice(1);
  }

  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null;

  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  let decimalSep = '';
  if (lastComma >= 0 && lastDot >= 0) {
    decimalSep = lastComma > lastDot ? ',' : '.';
  } else if (lastComma >= 0) {
    // "1,234" er tusenskille hvis nøyaktig tre siffer følger og det finnes flere grupper.
    decimalSep = s.length - lastComma - 1 === 3 && /^\d{1,3}(,\d{3})+$/.test(s) ? '' : ',';
  } else if (lastDot >= 0) {
    decimalSep = s.length - lastDot - 1 === 3 && /^\d{1,3}(\.\d{3})+$/.test(s) ? '' : '.';
  }

  let intPart = s;
  let fracPart = '';
  if (decimalSep) {
    const idx = s.lastIndexOf(decimalSep);
    intPart = s.slice(0, idx);
    fracPart = s.slice(idx + 1);
  }

  intPart = intPart.replace(/[.,]/g, '');
  fracPart = fracPart.replace(/[.,]/g, '');
  if (intPart === '') intPart = '0';
  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(fracPart)) return null;

  const ore = Math.round(Number(intPart) * 100 + Number((fracPart + '00').slice(0, 2)));
  if (!Number.isFinite(ore)) return null;
  return negative ? -ore : ore;
}

const nokFormat = new Intl.NumberFormat('nb-NO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const nokFormatExact = new Intl.NumberFormat('nb-NO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 123456 øre -> "1 235 kr" */
export function kr(ore: number): string {
  return `${nokFormat.format(Math.round(ore / 100))} kr`;
}

/** 123456 øre -> "1 234,56 kr" */
export function krExact(ore: number): string {
  return `${nokFormatExact.format(ore / 100)} kr`;
}

export function kroner(ore: number): number {
  return ore / 100;
}

export function toOre(kronerValue: number): number {
  return Math.round(kronerValue * 100);
}
