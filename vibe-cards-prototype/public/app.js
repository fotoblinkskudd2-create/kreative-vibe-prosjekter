// Vibe Cards — vanilla JS, ingen byggesteg.
// Funksjoner: auth, kort-CRUD, søk, filtrering, paginering, redigering, toast.

const state = {
  token: localStorage.getItem('vibe_token') || null,
  user: safeParseJSON(localStorage.getItem('vibe_user'), null),
  cards: [],
  moods: [],
  activeMood: null,
  searchQuery: '',
  page: 1,
  total: 0,
  limit: 24,
  editingCardId: null,
};

function safeParseJSON(str, fallback) {
  try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
}

const el = (id) => document.getElementById(id);

// ─── API ────────────────────────────────────────────────────────────────────

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error || (data.errors && data.errors.join(' ')) || 'Noe gikk feil.';
    throw new Error(message);
  }
  return data;
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

function setAuth(token, user) {
  state.token = token;
  state.user = user;
  if (token) {
    localStorage.setItem('vibe_token', token);
    localStorage.setItem('vibe_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('vibe_token');
    localStorage.removeItem('vibe_user');
  }
  renderAuthArea();
  el('newCardBtn').disabled = !token;
  renderCards();
}

function renderAuthArea() {
  const area = el('authArea');
  if (state.user) {
    area.innerHTML = `
      <span class="auth-name">${escapeHtml(state.user.name)}</span>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Logg ut</button>
    `;
    el('logoutBtn').addEventListener('click', () => {
      setAuth(null, null);
      showToast('Du er logget ut.');
    });
  } else {
    area.innerHTML = `
      <button class="btn btn-ghost btn-sm" id="loginBtn">Logg inn</button>
      <button class="btn btn-primary btn-sm" id="registerBtn">Registrer</button>
    `;
    el('loginBtn').addEventListener('click', () => el('loginModal').showModal());
    el('registerBtn').addEventListener('click', () => el('registerModal').showModal());
  }
}

// ─── FILTRE OG STATS ─────────────────────────────────────────────────────────

function renderFilters() {
  const container = el('moodFilters');
  const allChip = `<button class="filter-chip ${!state.activeMood ? 'active' : ''}" data-mood="">Alle</button>`;
  const chips = state.moods
    .map((m) => `<button class="filter-chip ${state.activeMood === m ? 'active' : ''}" data-mood="${m}">${m}</button>`)
    .join('');
  container.innerHTML = allChip + chips;
  container.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.activeMood = chip.dataset.mood || null;
      state.page = 1;
      loadCards();
    });
  });
}

async function renderStats() {
  try {
    const stats = await api('/stats');
    const bar = el('statsBar');
    if (!bar) return;
    bar.innerHTML = `
      <span><strong>${stats.total}</strong> kort totalt</span>
      <span><strong>${stats.users}</strong> brukere</span>
      ${Object.entries(stats.moodCounts || {}).map(([m, n]) => `<span>${m}: <strong>${n}</strong></span>`).join('')}
    `;
  } catch { /* stille feil */ }
}

// ─── KORT ────────────────────────────────────────────────────────────────────

const MOOD_EMOJIS = { rolig: '🌊', energisk: '⚡', kreativ: '🎨', nostalgisk: '🍂', fokusert: '🎯' };

function renderCards() {
  const grid = el('cardGrid');

  if (state.cards.length === 0) {
    const msg = state.activeMood || state.searchQuery
      ? 'Ingen kort matcher filteret ditt.'
      : 'Ingen kort her enda. Bli den første til å dele en vibe!';
    grid.innerHTML = `
      <div class="empty-state">
        <span class="empty-emoji">🃏</span>
        <p>${msg}</p>
      </div>`;
    renderPagination();
    return;
  }

  grid.innerHTML = state.cards
    .map((card) => {
      const liked = state.user && card.likes.includes(state.user.id);
      const isOwner = state.user && card.ownerId === state.user.id;
      const emoji = MOOD_EMOJIS[card.mood] || '✨';
      return `
        <article class="card" style="--accent: ${escapeHtml(card.color)}">
          <div class="card-mood-badge">${emoji} ${escapeHtml(card.mood)}</div>
          <h3 class="card-title">${escapeHtml(card.title)}</h3>
          ${card.description ? `<p class="card-desc">${escapeHtml(card.description)}</p>` : ''}
          ${card.tags.length ? `<div class="card-tags">${card.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
          <div class="card-footer">
            <button class="like-btn ${liked ? 'liked' : ''}" data-id="${card.id}" ${state.user ? '' : 'disabled'} title="${liked ? 'Fjern like' : 'Lik'}">
              ${liked ? '♥' : '♡'} ${card.likes.length}
            </button>
            ${isOwner ? `
              <div class="card-owner-actions">
                <button class="icon-btn" data-edit="${card.id}" title="Rediger">✏️</button>
                <button class="icon-btn delete" data-delete="${card.id}" title="Slett">🗑</button>
              </div>` : ''}
          </div>
        </article>
      `;
    })
    .join('');

  grid.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', () => toggleLike(btn.dataset.id));
  });
  grid.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.edit));
  });
  grid.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deleteCard(btn.dataset.delete));
  });

  renderPagination();
}

function renderPagination() {
  const container = el('pagination');
  if (!container) return;
  const totalPages = Math.ceil(state.total / state.limit);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  container.innerHTML = `
    <button class="btn btn-ghost btn-sm" id="prevPage" ${state.page <= 1 ? 'disabled' : ''}>← Forrige</button>
    <span class="page-info">Side ${state.page} av ${totalPages} (${state.total} kort)</span>
    <button class="btn btn-ghost btn-sm" id="nextPage" ${state.page >= totalPages ? 'disabled' : ''}>Neste →</button>
  `;
  el('prevPage')?.addEventListener('click', () => { state.page--; loadCards(); window.scrollTo(0, 0); });
  el('nextPage')?.addEventListener('click', () => { state.page++; loadCards(); window.scrollTo(0, 0); });
}

async function loadCards() {
  const params = new URLSearchParams({ page: state.page, limit: state.limit });
  if (state.activeMood) params.set('mood', state.activeMood);
  if (state.searchQuery) params.set('search', state.searchQuery);

  try {
    const data = await api(`/cards?${params}`);
    state.cards = data.cards;
    state.moods = data.moods;
    state.total = data.total;
    renderFilters();
    renderCards();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function toggleLike(id) {
  try {
    await api(`/cards/${id}/like`, { method: 'POST' });
    await loadCards();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function deleteCard(id) {
  if (!confirm('Slette dette kortet? Dette kan ikke angres.')) return;
  try {
    await api(`/cards/${id}`, { method: 'DELETE' });
    showToast('Kortet ble slettet.');
    state.page = 1;
    await loadCards();
    await renderStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ─── REDIGER MODAL ───────────────────────────────────────────────────────────

function openEditModal(id) {
  const card = state.cards.find((c) => c.id === id);
  if (!card) return;
  state.editingCardId = id;

  el('editTitle').value = card.title;
  el('editDescription').value = card.description || '';
  el('editMood').value = card.mood;
  el('editColor').value = card.color;
  el('editTags').value = card.tags.join(', ');
  el('editError').textContent = '';
  el('editModal').showModal();
}

el('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = state.editingCardId;
  if (!id) return;

  const tags = String(el('editTags').value || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    await api(`/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: el('editTitle').value,
        description: el('editDescription').value,
        mood: el('editMood').value,
        color: el('editColor').value,
        tags,
      }),
    });
    el('editError').textContent = '';
    el('editModal').close();
    state.editingCardId = null;
    showToast('Kortet ble oppdatert.');
    await loadCards();
  } catch (err) {
    el('editError').textContent = err.message;
  }
});

// ─── NYTT KORT MODAL ─────────────────────────────────────────────────────────

el('newCardBtn').addEventListener('click', () => {
  el('cardForm').reset();
  el('cardError').textContent = '';
  el('cardModal').showModal();
});

el('cardForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const tags = String(form.get('tags') || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    await api('/cards', {
      method: 'POST',
      body: JSON.stringify({
        title: form.get('title'),
        mood: form.get('mood'),
        color: form.get('color'),
        description: form.get('description'),
        tags,
      }),
    });
    el('cardError').textContent = '';
    el('cardModal').close();
    e.target.reset();
    showToast('Vibe-kortet ble opprettet!');
    state.page = 1;
    await loadCards();
    await renderStats();
  } catch (err) {
    el('cardError').textContent = err.message;
  }
});

// ─── AUTH MODALER ────────────────────────────────────────────────────────────

el('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    });
    setAuth(data.token, data.user);
    el('loginError').textContent = '';
    el('loginModal').close();
    e.target.reset();
    showToast(`Velkommen tilbake, ${data.user.name}!`);
  } catch (err) {
    el('loginError').textContent = err.message;
  }
});

el('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      }),
    });
    setAuth(data.token, data.user);
    el('registerError').textContent = '';
    el('registerModal').close();
    e.target.reset();
    showToast(`Velkommen, ${data.user.name}!`);
  } catch (err) {
    el('registerError').textContent = err.message;
  }
});

// ─── SØKEFELT ────────────────────────────────────────────────────────────────

let searchTimer;
el('searchInput')?.addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.searchQuery = e.target.value.trim();
    state.page = 1;
    loadCards();
  }, 280);
});

// ─── MODAL LUKKING ───────────────────────────────────────────────────────────

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => el(btn.dataset.close).close());
});

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
});

// ─── HJELPEFUNKSJONER ────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let toastTimer;
function showToast(message, isError = false) {
  const toast = el('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast' + (isError ? ' error' : '');
  requestAnimationFrame(() => {
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  });
}

// ─── INIT ────────────────────────────────────────────────────────────────────

renderAuthArea();
el('newCardBtn').disabled = !state.token;
loadCards().catch((err) => console.error(err));
renderStats().catch(() => {});
