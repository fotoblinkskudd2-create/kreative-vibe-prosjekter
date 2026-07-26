/* Enkel hash-ruter mellom de fire fanene. */

import { clear } from './dom.js';
import renderHome from './pages/home.js';
import renderBreathe from './pages/breathe.js';
import renderActions from './pages/actions.js';
import renderHistory from './pages/history.js';

const routes = {
  hjem: renderHome,
  pusterom: renderBreathe,
  smaagrep: renderActions,
  historikk: renderHistory
};

const view = document.getElementById('view');
let cleanup = null;

function currentRoute() {
  const name = location.hash.replace(/^#\/?/, '').split('?')[0];
  return routes[name] ? name : 'hjem';
}

function render() {
  const name = currentRoute();

  if (typeof cleanup === 'function') cleanup();
  cleanup = null;

  clear(view);
  // Start animasjonen på nytt ved hvert sidebytte.
  view.style.animation = 'none';
  void view.offsetWidth;
  view.style.animation = '';

  cleanup = routes[name](view) || null;

  for (const tab of document.querySelectorAll('.tab')) {
    if (tab.dataset.tab === name) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }

  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

window.addEventListener('hashchange', render);

if (!location.hash) location.replace('#/hjem');
render();
