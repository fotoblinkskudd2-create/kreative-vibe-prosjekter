import { describe, expect, it } from 'vitest';
import { demoCsv } from '../src/lib/demo';
import { detectRecurring } from '../src/lib/recurring';
import { analyze } from '../src/lib/scan';
import { parseStatementText } from '../src/lib/statement';
import type { Transaction } from '../src/lib/types';

function tx(date: string, text: string, kroner: number, seq = 0): Transaction {
  const parsed = parseStatementText(`Dato;Tekst;Beløp\n${date};${text};${kroner}`);
  return { ...parsed.transactions[0], id: `${date}-${seq}` };
}

function monthly(text: string, kroner: number, months: number, day = '15'): Transaction[] {
  return Array.from({ length: months }, (_, i) =>
    tx(`${day}.${String(i + 1).padStart(2, '0')}.2025`, text, kroner, i),
  );
}

describe('detectRecurring', () => {
  it('finner et månedlig abonnement', () => {
    const subs = detectRecurring(monthly('NETFLIX.COM', -179, 4));
    expect(subs).toHaveLength(1);
    expect(subs[0].merchant).toBe('netflix');
    expect(subs[0].cadence).toBe('månedlig');
    expect(subs[0].monthlyCost).toBeGreaterThan(17000);
    expect(subs[0].monthlyCost).toBeLessThan(19000);
  });

  it('regner kvartalsvise trekk om til månedspris', () => {
    const txs = [
      tx('05.01.2025', 'GJENSIDIGE FORSIKRING', -2400, 1),
      tx('05.04.2025', 'GJENSIDIGE FORSIKRING', -2400, 2),
      tx('05.07.2025', 'GJENSIDIGE FORSIKRING', -2400, 3),
    ];
    const subs = detectRecurring(txs);
    expect(subs[0].cadence).toBe('kvartalsvis');
    expect(Math.round(subs[0].monthlyCost / 100)).toBeGreaterThan(750);
    expect(Math.round(subs[0].monthlyCost / 100)).toBeLessThan(830);
  });

  it('lar tilfeldige dagligvarekjøp være i fred', () => {
    const txs = [
      tx('02.01.2025', 'REMA 1000 TOYEN', -412, 1),
      tx('05.01.2025', 'REMA 1000 TOYEN', -188, 2),
      tx('11.01.2025', 'REMA 1000 TOYEN', -640, 3),
      tx('19.01.2025', 'REMA 1000 TOYEN', -233, 4),
    ];
    expect(detectRecurring(txs)).toHaveLength(0);
  });

  it('oppdager prisøkning i et fast trekk', () => {
    const txs = [
      ...monthly('SATS NORGE AS', -499, 4),
      tx('15.05.2025', 'SATS NORGE AS', -599, 5),
      tx('15.06.2025', 'SATS NORGE AS', -599, 6),
    ];
    const sub = detectRecurring(txs)[0];
    expect(sub.priceIncrease).not.toBeNull();
    expect(sub.priceIncrease!).toBeGreaterThan(0.1);
  });

  it('ignorerer innbetalinger', () => {
    expect(detectRecurring(monthly('LONN ARBEIDSGIVER AS', 38400, 4))).toHaveLength(0);
  });
});

describe('analyze på demodata', () => {
  const parsed = parseStatementText(demoCsv(new Date('2025-07-31T12:00:00Z')));
  const result = analyze(parsed.transactions, parsed.warnings);

  it('leser hele demoutskriften', () => {
    expect(parsed.warnings).toEqual([]);
    expect(result.transactions.length).toBeGreaterThan(200);
    expect(result.months).toBeGreaterThan(3);
  });

  it('finner de faste trekkene', () => {
    const merchants = result.recurring.map((r) => r.merchant);
    for (const expected of ['netflix', 'hbomax', 'spotify', 'sats', 'strom', 'forsikring']) {
      expect(merchants).toContain(expected);
    }
  });

  it('finner overlappende strømmetjenester og musikktjenester', () => {
    const ids = result.leaks.map((l) => l.id);
    expect(ids).toContain('overlapp-strømming');
    expect(ids).toContain('overlapp-musikk');
  });

  it('finner takeaway, gebyrer og strøm', () => {
    const ids = result.leaks.map((l) => l.id);
    expect(ids).toContain('takeaway');
    expect(ids).toContain('gebyrer');
    expect(ids).toContain('strom');
  });

  it('lander på en besparelse i riktig størrelsesorden', () => {
    const perMonthKroner = result.monthlySaving / 100;
    expect(perMonthKroner).toBeGreaterThan(2000);
    expect(perMonthKroner).toBeLessThan(12000);
  });

  it('foreslår aldri å spare mer enn det som faktisk brukes', () => {
    const monthlyOut = result.totalOut / result.months;
    expect(result.monthlySaving).toBeLessThan(monthlyOut);
    for (const leak of result.leaks) {
      expect(leak.monthlySaving).toBeLessThanOrEqual(leak.monthlyCost);
    }
  });

  it('gir hver lekkasje en handling med konkrete steg', () => {
    for (const leak of result.leaks) {
      expect(leak.action.steps.length).toBeGreaterThan(1);
      expect(leak.title.length).toBeGreaterThan(3);
      expect(leak.evidence.length).toBeGreaterThan(0);
    }
  });
});
