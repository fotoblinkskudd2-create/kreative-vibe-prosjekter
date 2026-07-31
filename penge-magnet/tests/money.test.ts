import { describe, expect, it } from 'vitest';
import { kr, parseAmount } from '../src/lib/money';

describe('parseAmount', () => {
  it('tolker norsk format med mellomrom og komma', () => {
    expect(parseAmount('1 234,56')).toBe(123456);
    expect(parseAmount('1 234,56')).toBe(123456); // hardt mellomrom
    expect(parseAmount('1.234,56')).toBe(123456);
  });

  it('tolker engelsk format', () => {
    expect(parseAmount('1,234.56')).toBe(123456);
    expect(parseAmount('1234.56')).toBe(123456);
  });

  it('tolker tusenskille uten desimaler', () => {
    expect(parseAmount('1,234')).toBe(123400);
    expect(parseAmount('1.234')).toBe(123400);
    expect(parseAmount('12,50')).toBe(1250);
  });

  it('håndterer fortegn og valuta', () => {
    expect(parseAmount('-179,00')).toBe(-17900);
    expect(parseAmount('−179,00')).toBe(-17900); // unicode minus
    expect(parseAmount('(179,00)')).toBe(-17900);
    expect(parseAmount('179,00 kr')).toBe(17900);
    expect(parseAmount('+50')).toBe(5000);
  });

  it('avviser tekst', () => {
    expect(parseAmount('Beløp')).toBeNull();
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('  ')).toBeNull();
  });

  it('formaterer kroner', () => {
    expect(kr(123456).replace(/ /g, ' ')).toBe('1 235 kr');
  });
});
