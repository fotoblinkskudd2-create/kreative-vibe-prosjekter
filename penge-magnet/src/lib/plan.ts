import { formatNo } from './dates';
import { kr } from './money';
import type { FixState, ScanResult } from './types';

/**
 * Bygger hele fiksplanen som ren tekst — inkludert ferdige oppsigelser.
 * Dette er "Fiks alt"-knappens faktiske leveranse: en liste du kan jobbe deg gjennom,
 * ikke en dialogboks som later som om noe ble sendt.
 */
export function buildPlanText(result: ScanResult, fixes: FixState): string {
  const open = result.leaks.filter((l) => (fixes.status[l.id] ?? 'åpen') === 'åpen');
  const done = result.leaks.filter((l) => fixes.status[l.id] === 'gjort');
  const openSaving = open.reduce((acc, l) => acc + l.monthlySaving, 0);

  const lines: string[] = [
    'PENGE-MAGNET — FIKSPLAN',
    '='.repeat(52),
    `Periode analysert: ${formatNo(result.periodStart)} – ${formatNo(result.periodEnd)} (${result.months} måneder)`,
    `Transaksjoner lest: ${result.transactions.length}`,
    `Funn: ${result.leaks.length} lekkasjer, ${kr(result.monthlySaving)}/mnd totalt`,
    `Gjenstår å fikse: ${kr(openSaving)}/mnd = ${kr(openSaving * 12)} i året`,
    '',
    'GJØR DETTE, I DENNE REKKEFØLGEN:',
    '',
  ];

  open.forEach((leak, i) => {
    lines.push(`${i + 1}. ${leak.title}`);
    lines.push(`   Gevinst: ${kr(leak.monthlySaving)}/mnd (${kr(leak.monthlySaving * 12)}/år)`);
    lines.push(`   ${leak.action.label}`);
    leak.action.steps.forEach((step) => lines.push(`     - ${step}`));
    if (leak.action.email) {
      lines.push('');
      lines.push('   FERDIG OPPSIGELSE — les gjennom og send selv:');
      lines.push(`   Til: ${leak.action.email.to ?? '(kundeservice hos leverandøren)'}`);
      lines.push(`   Emne: ${leak.action.email.subject}`);
      leak.action.email.body.split('\n').forEach((l) => lines.push(`   | ${l}`));
    }
    lines.push('');
  });

  if (done.length > 0) {
    lines.push('ALLEREDE FIKSET:');
    done.forEach((leak) => {
      const at = fixes.doneAt[leak.id];
      lines.push(
        `  [x] ${leak.title} — ${kr(leak.monthlySaving)}/mnd${
          at ? ` (markert ${formatNo(at.slice(0, 10))})` : ''
        }`,
      );
    });
    lines.push('');
  }

  lines.push('-'.repeat(52));
  lines.push('Appen sender ingenting selv. Du godkjenner og sender hver oppsigelse.');
  lines.push('Sett en påminnelse om 30 dager: skann på nytt og sjekk at trekkene faktisk stoppet.');

  return lines.join('\n');
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
