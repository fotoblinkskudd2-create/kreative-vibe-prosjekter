import { formatNo } from './dates';
import { ruleFor } from './merchants';
import { krExact } from './money';
import type { Recurring } from './types';

/** Lager en ferdig oppsigelse. Du leser gjennom og sender selv — appen sender ingenting. */
export function cancellationEmail(sub: Recurring): {
  to: string | null;
  subject: string;
  body: string;
} {
  const contact = ruleFor(sub.merchant)?.contact ?? null;
  const subject = `Oppsigelse av abonnement – ${sub.merchantLabel}`;
  const body = [
    'Hei,',
    '',
    `Jeg sier med dette opp abonnementet mitt hos ${sub.merchantLabel}.`,
    '',
    `Siste trekk jeg kan se: ${krExact(sub.typicalAmount)} den ${formatNo(sub.lastDate)}.`,
    'Jeg ber om at abonnementet avsluttes ved utløpet av inneværende betalingsperiode,',
    'og at det ikke gjennomføres flere trekk etter dette.',
    '',
    'Jeg ber om skriftlig bekreftelse på oppsigelsen, med dato for når den trer i kraft.',
    '',
    'Navn:',
    'Kundenummer / e-post registrert hos dere:',
    '',
    'Med vennlig hilsen',
  ].join('\n');

  return { to: contact, subject, body };
}

export function mailtoLink(email: {
  to: string | null;
  subject: string;
  body: string;
}): string {
  const target = email.to && email.to.includes('@') ? email.to : '';
  const params = new URLSearchParams({ subject: email.subject, body: email.body });
  return `mailto:${target}?${params.toString().replace(/\+/g, '%20')}`;
}
