/* Historikk – «Din oversikt». Rolig, kronologisk liste over tidligere innsjekk. */

import { el, friendlyDate, clockTime } from '../dom.js';
import { getCheckins, moodById, careCountThisWeek } from '../store.js';

export default function renderHistory(root) {
  const checkins = getCheckins();

  if (checkins.length === 0) {
    root.append(
      el('div', { class: 'stack-lg' }, [
        el('header', { class: 'stack' }, [
          el('h1', { text: 'Din oversikt' })
        ]),
        el('section', { class: 'card card-airy card-tinted center stack' }, [
          el('p', { class: 'lead', text: 'Her blir innsjekkene dine liggende.' }),
          el('p', {
            class: 'muted',
            text: 'Når du har sjekket inn en gang eller to, kan du bla tilbake og se hvordan dagene har vært.'
          }),
          el('a', {
            class: 'btn btn-soft',
            href: '#/hjem',
            text: 'Sjekk inn nå',
            style: 'text-decoration:none'
          })
        ])
      ])
    );
    return;
  }

  const rows = [];
  let lastDay = null;

  for (const entry of checkins) {
    if (entry.day !== lastDay) {
      lastDay = entry.day;
      rows.push(el('p', { class: 'day-label', text: friendlyDate(entry.at) }));
    }
    rows.push(makeRow(entry));
  }

  root.append(
    el('div', { class: 'stack-lg' }, [
      el('header', { class: 'stack' }, [
        el('h1', { text: 'Din oversikt' }),
        el('p', {
          class: 'lead',
          text: 'Bare en rolig liste over gangene du har sjekket inn. Ingen kurver, ingen vurdering.'
        })
      ]),

      el('section', { class: 'history' }, rows),

      el('section', { class: 'card card-tinted center' }, [
        el('p', { class: 'lead', text: weekSummary() })
      ])
    ])
  );
}

function makeRow(entry) {
  const mood = moodById(entry.mood);
  const hasNote = Boolean(entry.note);

  const note = el('p', { class: 'entry-note muted', text: entry.note });
  note.hidden = true;
  note.id = `note-${entry.id}`;

  const head = el(
    'button',
    {
      class: 'entry-head',
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': hasNote ? note.id : null,
      disabled: !hasNote,
      onclick: () => {
        const open = head.getAttribute('aria-expanded') === 'true';
        head.setAttribute('aria-expanded', String(!open));
        note.hidden = open;
      }
    },
    [
      el('span', { class: 'entry-face', 'aria-hidden': 'true', text: mood ? mood.emoji : '·' }),
      el('span', { class: 'entry-text' }, [
        el('span', { class: 'entry-mood', text: mood ? mood.label : 'Innsjekk' }),
        el('span', {
          class: 'faint',
          text: hasNote ? `${clockTime(entry.at)} · notat` : clockTime(entry.at)
        })
      ]),
      hasNote ? el('span', { class: 'chev chev-down', 'aria-hidden': 'true', text: '›' }) : null
    ]
  );

  return el('article', { class: 'entry' }, [head, hasNote ? note : null]);
}

function weekSummary() {
  const n = careCountThisWeek();

  if (n === 0) return 'Ta vare på deg selv når du orker. Det er ingen hast.';
  if (n === 1) return 'Du har tatt vare på deg selv 1 gang denne uken. Det er fint.';
  return `Du har tatt vare på deg selv ${n} ganger denne uken. Det er fint.`;
}
