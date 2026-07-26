/* Små grep – sju enkle handlinger som kan hjelpe litt akkurat nå. */

import { el } from '../dom.js';
import { getDoneToday, toggleActionDone } from '../store.js';

const ACTIONS = [
  {
    id: 'frisk-luft',
    title: 'Gå ut i frisk luft i 5 minutter',
    why: 'Du trenger ikke gå langt. Bare det å komme ut døra, kjenne temperaturen og se noe annet enn de samme veggene, gjør ofte at hodet roer seg litt.'
  },
  {
    id: 'vann',
    title: 'Drikk et glass vann sakte',
    why: 'Når vi er stresset glemmer vi ofte å drikke. Ta glasset med begge hender og drikk sakte – det blir en liten pause helt av seg selv.'
  },
  {
    id: 'foetter',
    title: 'Sett deg ned og kjenn føttene mot gulvet',
    why: 'Å flytte oppmerksomheten ned i kroppen er en av de raskeste måtene å komme ut av tankekjøret på. Kjenn vekten, underlaget, sålene.'
  },
  {
    id: 'takknemlig',
    title: 'Skriv ned én ting du er takknemlig for',
    why: 'Den trenger ikke være stor. En kopp kaffe, et lys ute, noen som skrev til deg. Det handler ikke om å tenke positivt, bare om å se noe annet også.'
  },
  {
    id: 'tre-pust',
    title: 'Ta tre dype pust der du er',
    why: 'Tre pust tar under et halvt minutt, og du trenger ikke reise deg. La utpusten være litt lengre enn innpusten.'
  },
  {
    id: 'telefon',
    title: 'Legg telefonen bort i 10 minutter',
    why: 'Ti minutter uten skjerm gir hodet en sjanse til å senke tempoet. Legg den gjerne i et annet rom, så slipper du å bestemme deg på nytt hele tiden.'
  },
  {
    id: 'strekk',
    title: 'Strekk armene over hodet og pust tre ganger',
    why: 'Kroppen holder ofte på spenning i skuldre og rygg uten at vi merker det. En lang strekk sier fra til nervesystemet om at faren er over.'
  }
];

export default function renderActions(root) {
  const done = getDoneToday();

  const summary = el('p', { class: 'faint center' });

  function updateSummary() {
    const n = done.size;
    summary.textContent =
      n === 0
        ? 'Ingenting er krysset av i dag – og det er helt greit.'
        : n === 1
          ? 'Du har gjort ett lite grep i dag. Det teller.'
          : `Du har gjort ${n} små grep i dag. Fint jobbet.`;
  }

  const cards = ACTIONS.map((action, index) => makeCard(action, index));

  function makeCard(action, index) {
    const why = el('p', { class: 'action-why muted', text: action.why });
    const panelId = `why-${action.id}`;
    why.id = panelId;
    why.hidden = true;

    const head = el(
      'button',
      {
        class: 'action-head',
        type: 'button',
        'aria-expanded': 'false',
        'aria-controls': panelId,
        onclick: () => {
          const open = head.getAttribute('aria-expanded') === 'true';
          head.setAttribute('aria-expanded', String(!open));
          why.hidden = open;
        }
      },
      [
        el('span', { class: 'action-num', 'aria-hidden': 'true', text: String(index + 1) }),
        el('span', { class: 'action-title', text: action.title }),
        el('span', { class: 'chev chev-down', 'aria-hidden': 'true', text: '›' })
      ]
    );

    const mark = el('button', {
      class: 'action-mark',
      type: 'button',
      'aria-pressed': String(done.has(action.id)),
      text: done.has(action.id) ? '✓ Gjort i dag' : 'Marker som gjort i dag',
      onclick: () => {
        const isDone = toggleActionDone(action.id);
        isDone ? done.add(action.id) : done.delete(action.id);
        mark.setAttribute('aria-pressed', String(isDone));
        mark.textContent = isDone ? '✓ Gjort i dag' : 'Marker som gjort i dag';
        card.dataset.done = String(isDone);
        updateSummary();
      }
    });

    const card = el('article', { class: 'card action', dataset: { done: String(done.has(action.id)) } }, [
      head,
      why,
      mark
    ]);

    return card;
  }

  updateSummary();

  root.append(
    el('div', { class: 'stack-lg' }, [
      el('header', { class: 'stack' }, [
        el('h1', { text: 'Små grep som kan hjelpe nå' }),
        el('p', {
          class: 'lead',
          text: 'Velg ett hvis du orker. Ett er nok – og null er også et svar.'
        })
      ]),

      el('section', { class: 'stack' }, cards),

      summary
    ])
  );
}
