import { describe, expect, it } from 'vitest';
import { sniffDelimiter } from '../src/lib/csv';
import { parseDate } from '../src/lib/dates';
import { parseFreeformLine, parseStatementText } from '../src/lib/statement';

const DNB = `Dato;Forklaring;Rentedato;Ut fra konto;Inn på konto
31.01.2025;NETFLIX.COM AMSTERDAM;31.01.2025;179,00;
30.01.2025;REMA 1000 TOYEN;30.01.2025;412,50;
25.01.2025;LØNN ARBEIDSGIVER AS;25.01.2025;;38 400,00`;

const SBANKEN = `"Bokføringsdato","Beløp","Beskrivelse"
"2025-01-31","-179.00","Netflix.com"
"2025-01-30","-412.50","Rema 1000, Tøyen"
"2025-01-25","38400.00","Lønn"`;

const MED_TOPPTEKST = `Kontoutskrift for konto 1234.56.78901
Periode: 01.01.2025 - 31.01.2025

Bokføringsdato;Beskrivelse;Beløp
31.01.2025;SPOTIFY P26F8D9;-129,00
30.01.2025;FOODORA NORWAY AS;-389,00`;

describe('parseStatementText', () => {
  it('leser DNB-format med separate ut/inn-kolonner', () => {
    const result = parseStatementText(DNB);
    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0].amount).toBe(-17900);
    expect(result.transactions[0].merchant).toBe('netflix');
    const lonn = result.transactions.find((t) => t.amount > 0);
    expect(lonn?.amount).toBe(3840000);
  });

  it('leser format med anførselstegn, komma og ISO-datoer', () => {
    const result = parseStatementText(SBANKEN);
    expect(result.transactions).toHaveLength(3);
    // Radene beholdes i filens rekkefølge; sortering skjer i analyze().
    expect(result.transactions[0].date).toBe('2025-01-31');
    expect(result.transactions[0].amount).toBe(-17900);
    expect(result.transactions.at(-1)?.amount).toBe(3840000);
  });

  it('hopper over topptekst før kolonneoverskriftene', () => {
    const result = parseStatementText(MED_TOPPTEKST);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions.map((t) => t.merchant).sort()).toEqual(['foodora', 'spotify']);
  });

  it('gir en forståelig advarsel når filen ikke er en utskrift', () => {
    const result = parseStatementText('hei;dette;er;ikke;en;utskrift');
    expect(result.transactions).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('sniffDelimiter', () => {
  it('kjenner igjen semikolon, komma og tab', () => {
    expect(sniffDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(sniffDelimiter('a,b,c\n1,2,3')).toBe(',');
    expect(sniffDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t');
  });

  it('lar seg ikke lure av komma inne i anførselstegn', () => {
    expect(sniffDelimiter('"Rema 1000, Tøyen";-412,50\n"Kiwi, Grønland";-210,00')).toBe(';');
  });
});

describe('parseDate', () => {
  it('tolker norske og ISO-datoer', () => {
    expect(parseDate('31.01.2025')).toBe('2025-01-31');
    expect(parseDate('2025-01-31')).toBe('2025-01-31');
    expect(parseDate('1.2.25')).toBe('2025-02-01');
    expect(parseDate('20250131')).toBe('2025-01-31');
  });

  it('avviser umulige datoer', () => {
    expect(parseDate('32.01.2025')).toBeNull();
    expect(parseDate('31.02.2025')).toBeNull();
    expect(parseDate('ikke en dato')).toBeNull();
  });
});

describe('parseFreeformLine', () => {
  it('leser en linje limt inn fra PDF', () => {
    const line = '31.01.2025  NETFLIX.COM AMSTERDAM   -179,00';
    expect(parseFreeformLine(line)).toEqual({
      date: '2025-01-31',
      text: 'NETFLIX.COM AMSTERDAM',
      amount: -17900,
    });
  });

  it('hopper over en ekstra rentedato', () => {
    const line = '31.01.2025 31.01.2025  REMA 1000 TOYEN   -412,50';
    expect(parseFreeformLine(line)?.text).toBe('REMA 1000 TOYEN');
  });

  it('returnerer null for linjer uten dato', () => {
    expect(parseFreeformLine('Sum uttak 12 400,00')).toBeNull();
  });
});
