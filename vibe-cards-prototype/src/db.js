// Lett datalag for prototyping: lagrer users/cards i en JSON-fil på disk.
// Samme datamodell som schema.sql → bytt enkelt ut med en ekte Postgres/Mongo-klient senere.
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');
const TMP_FILE = DB_FILE + '.tmp';

function seedData() {
  const now = new Date().toISOString();
  return {
    users: [],
    cards: [
      {
        id: 'seed-1',
        ownerId: null,
        title: 'Morgenro',
        description: 'Stille kaffe, sol gjennom vinduet, ingen hast.',
        mood: 'rolig',
        color: '#7FB3A8',
        tags: ['morgen', 'ro', 'kaffe'],
        likes: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'seed-2',
        ownerId: null,
        title: 'Kreativ flyt',
        description: 'Musikk i hørene, idéer som bare kommer av seg selv.',
        mood: 'kreativ',
        color: '#B98AE0',
        tags: ['flyt', 'musikk', 'idéer'],
        likes: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'seed-3',
        ownerId: null,
        title: 'Friskt fjelltrøkk',
        description: 'Kald luft, pulsen opp, hodet helt klart.',
        mood: 'energisk',
        color: '#E08A4C',
        tags: ['tur', 'natur', 'energi'],
        likes: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'seed-4',
        ownerId: null,
        title: 'Dypt fokus',
        description: 'Headset på, verden ute. Bare oppgaven og deg.',
        mood: 'fokusert',
        color: '#5C7AEA',
        tags: ['fokus', 'arbeid', 'ro'],
        likes: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'seed-5',
        ownerId: null,
        title: 'Barndomslukt',
        description: 'Den der lukten etter regn på varm asfalt. Noe du ikke kan forklare.',
        mood: 'nostalgisk',
        color: '#C4956A',
        tags: ['minner', 'barn', 'sommer'],
        likes: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

function load() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = seedData();
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    console.warn('[db] Korrupt db.json, tilbakestiller til seed-data:', err.message);
    const initial = seedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function save(data) {
  const json = JSON.stringify(data, null, 2);
  // Atomisk skriving: skriv til .tmp, rename til ekte fil
  // Forhindrer korrupt db.json ved strømbrudd midt i skriving
  fs.writeFileSync(TMP_FILE, json);
  fs.renameSync(TMP_FILE, DB_FILE);
}

let state = load();

const db = {
  users: {
    findByEmail(email) {
      return state.users.find((u) => u.email === email.toLowerCase()) || null;
    },
    findById(id) {
      return state.users.find((u) => u.id === id) || null;
    },
    create(user) {
      state.users.push(user);
      save(state);
      return user;
    },
  },
  cards: {
    all({ mood, search, page = 1, limit = 50 } = {}) {
      let cards = [...state.cards];
      if (mood) {
        cards = cards.filter((c) => c.mood === mood);
      }
      if (search) {
        const q = search.toLowerCase();
        cards = cards.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            (c.description || '').toLowerCase().includes(q) ||
            c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      const total = cards.length;
      const offset = (page - 1) * limit;
      return { cards: cards.slice(offset, offset + limit), total, page, limit };
    },
    findById(id) {
      return state.cards.find((c) => c.id === id) || null;
    },
    create(card) {
      state.cards.unshift(card); // nyeste øverst
      save(state);
      return card;
    },
    update(id, patch) {
      const card = state.cards.find((c) => c.id === id);
      if (!card) return null;
      Object.assign(card, patch, { updatedAt: new Date().toISOString() });
      save(state);
      return card;
    },
    delete(id) {
      const index = state.cards.findIndex((c) => c.id === id);
      if (index === -1) return false;
      state.cards.splice(index, 1);
      save(state);
      return true;
    },
    stats() {
      const moodCounts = {};
      for (const card of state.cards) {
        moodCounts[card.mood] = (moodCounts[card.mood] || 0) + 1;
      }
      return {
        total: state.cards.length,
        users: state.users.length,
        moodCounts,
        mostLiked: [...state.cards].sort((a, b) => b.likes.length - a.likes.length).slice(0, 3),
      };
    },
  },
};

module.exports = db;
