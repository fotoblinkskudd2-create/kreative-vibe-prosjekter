/* Små grep – bygges ut i et senere steg. */

import { el } from '../dom.js';

export default function renderActions(root) {
  root.append(
    el('div', { class: 'placeholder' }, [
      el('h1', { text: 'Små grep' }),
      el('p', { class: 'lead', text: 'Kommer snart.' })
    ])
  );
}
