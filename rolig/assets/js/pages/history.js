/* Historikk – bygges ut i et senere steg. */

import { el } from '../dom.js';

export default function renderHistory(root) {
  root.append(
    el('div', { class: 'placeholder' }, [
      el('h1', { text: 'Historikk' }),
      el('p', { class: 'lead', text: 'Kommer snart.' })
    ])
  );
}
