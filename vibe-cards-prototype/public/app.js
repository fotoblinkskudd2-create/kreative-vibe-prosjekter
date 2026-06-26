// Vanilla JS frontend for Vibe Cards - ingen byggesteg nødvendig.
// Uses shared: escapeHtml, el from /shared/js/dom-utils.js
// Uses shared: createApiClient from /shared/js/api-client.js
const state = {
  token: localStorage.getItem('vibe_token') || null,
  user: JSON.parse(localStorage.getItem('vibe_user') || 'null'),
  cards: [],
  moods: [],
  activeMood: null,
};

const apiClient = createApiClient({
  baseUrl: '/api',
  getToken: () => state.token,
});
const api = (path, options = {}) => apiClient.request(path, options);

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
}

function renderAuthArea() {
  const area = el('authArea');
  if (state.user) {
    area.innerHTML = `
      <span class="card-mood">Hei, ${state.user.name}</span>
      <button class="btn btn-ghost" id="logoutBtn">Logg ut</button>
    `;
    el('logoutBtn').addEventListener('click', () => setAuth(null, null));
  } else {
    area.innerHTML = `
      <button class="btn btn-ghost" id="loginBtn">Logg inn</button>
      <button class="btn btn-primary" id="registerBtn">Registrer</button>
    `;
    el('loginBtn').addEventListener('click', () => el('loginModal').showModal());
    el('registerBtn').addEventListener('click', () => el('registerModal').showModal());
  }
}

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
      loadCards();
    });
  });
}

function renderCards() {
  const grid = el('cardGrid');
  if (state.cards.length === 0) {
    grid.innerHTML = '<div class="empty-state">Ingen kort her enda. Bli den første til å dele en vibe!</div>';
    return;
  }

  grid.innerHTML = state.cards
    .map((card) => {
      const liked = state.user && card.likes.includes(state.user.id);
      const isOwner = state.user && card.ownerId === state.user.id;
      return `
        <article class="card" style="--accent: ${card.color}">
          <span class="card-mood">${card.mood}</span>
          <h3 class="card-title">${escapeHtml(card.title)}</h3>
          <p class="card-desc">${escapeHtml(card.description || '')}</p>
          <div class="card-tags">${card.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>
          <div class="card-footer">
            <button class="like-btn ${liked ? 'liked' : ''}" data-id="${card.id}" ${state.user ? '' : 'disabled'}>
              ${liked ? '♥' : '♡'} ${card.likes.length}
            </button>
            ${isOwner ? `<div class="card-owner-actions"><button class="icon-btn" data-delete="${card.id}">Slett</button></div>` : ''}
          </div>
        </article>
      `;
    })
    .join('');

  grid.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', () => toggleLike(btn.dataset.id));
  });
  grid.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deleteCard(btn.dataset.delete));
  });
}

// escapeHtml is now provided by /shared/js/dom-utils.js

async function loadCards() {
  const query = state.activeMood ? `?mood=${encodeURIComponent(state.activeMood)}` : '';
  const data = await api(`/cards${query}`);
  state.cards = data.cards;
  state.moods = data.moods;
  renderFilters();
  renderCards();
}

async function toggleLike(id) {
  try {
    await api(`/cards/${id}/like`, { method: 'POST' });
    await loadCards();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteCard(id) {
  if (!confirm('Slette dette kortet?')) return;
  try {
    await api(`/cards/${id}`, { method: 'DELETE' });
    await loadCards();
  } catch (err) {
    alert(err.message);
  }
}

function closeModal(id) {
  el(id).close();
}

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

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
    closeModal('loginModal');
    e.target.reset();
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
    closeModal('registerModal');
    e.target.reset();
  } catch (err) {
    el('registerError').textContent = err.message;
  }
});

el('newCardBtn').addEventListener('click', () => el('cardModal').showModal());

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
    closeModal('cardModal');
    e.target.reset();
    await loadCards();
  } catch (err) {
    el('cardError').textContent = err.message;
  }
});

// Init
renderAuthArea();
el('newCardBtn').disabled = !state.token;
loadCards().catch((err) => console.error(err));
