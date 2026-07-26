/* Pusterom – bygges ut i neste steg. */

import { el } from '../dom.js';

export default function renderBreathe(root) {
  root.append(
    el('div', { class: 'placeholder' }, [
      el('h1', { text: 'Pusterom' }),
      el('p', { class: 'lead', text: 'Kommer snart.' })
    ])
  );
}
