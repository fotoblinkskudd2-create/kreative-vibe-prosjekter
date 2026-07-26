/* Hjem / Innsjekk – «Hvordan har du det akkurat nå?» */

import { el, clear, greeting } from '../dom.js';
import { MOODS, addCheckin } from '../store.js';

export default function renderHome(root) {
  let selected = null;

  const moodButtons = MOODS.map((mood) =>
    el(
      'button',
      {
        class: 'mood',
        type: 'button',
        'aria-pressed': 'false',
        'aria-label': mood.label,
        onclick: () => select(mood.id)
      },
      [
        el('span', { class: 'mood-face', 'aria-hidden': 'true', text: mood.emoji }),
        el('span', { class: 'mood-label', text: mood.label })
      ]
    )
  );

  const note = el('textarea', {
    id: 'note',
    rows: '4',
    placeholder: 'Det er helt greit å la feltet stå tomt.',
    maxlength: '2000'
  });

  const saveBtn = el('button', {
    class: 'btn',
    type: 'button',
    disabled: true,
    text: 'Lagre',
    onclick: save
  });

  const hint = el('p', {
    class: 'faint center',
    text: 'Velg gjerne en stemning når du er klar.'
  });

  function select(id) {
    selected = id;
    moodButtons.forEach((btn, i) => {
      btn.setAttribute('aria-pressed', String(MOODS[i].id === id));
    });
    saveBtn.disabled = false;
    hint.textContent = 'Du kan skrive noen ord hvis du vil – eller bare lagre.';
  }

  function save() {
    if (!selected) return;
    addCheckin({ mood: selected, note: note.value });
    showReceipt(root);
  }

  root.append(
    el('div', { class: 'stack-lg' }, [
      el('header', { class: 'stack' }, [
        el('p', { class: 'eyebrow', text: greeting() }),
        el('h1', { text: 'Hvordan har du det akkurat nå?' }),
        el('p', {
          class: 'lead',
          text: 'Det finnes ingen riktige svar. Bare kjenn etter et øyeblikk.'
        })
      ]),

      el('section', { class: 'card card-airy' }, [
        el('div', { class: 'mood-row', role: 'group', 'aria-label': 'Stemningsskala' }, moodButtons)
      ]),

      el('section', { class: 'field' }, [
        el('label', { for: 'note', text: 'Vil du skrive noen ord?' }),
        note
      ]),

      el('div', { class: 'stack' }, [saveBtn, hint])
    ])
  );
}

function showReceipt(root) {
  clear(root);

  root.append(
    el('div', { class: 'receipt' }, [
      el('div', { class: 'receipt-mark', 'aria-hidden': 'true', text: '🌿' }),
      el('h1', { text: 'Takk. Det er bra at du sjekket inn.' }),
      el('p', {
        class: 'lead',
        text: 'Du trenger ikke gjøre noe mer nå. Men hvis du vil, ligger pusterommet klart.'
      }),
      el('div', { class: 'spacer-sm' }),
      el('div', { class: 'stack', style: 'width:100%' }, [
        el('a', {
          class: 'btn btn-soft',
          href: '#/pusterom',
          text: 'Gå til Pusterom',
          style: 'text-decoration:none'
        }),
        el('button', {
          class: 'btn btn-ghost',
          type: 'button',
          text: 'Sjekk inn på nytt',
          onclick: () => {
            clear(root);
            renderHome(root);
          }
        })
      ])
    ])
  );

  root.focus();
}
