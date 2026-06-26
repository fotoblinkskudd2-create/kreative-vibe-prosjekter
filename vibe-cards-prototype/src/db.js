// Lett datalag for prototyping: lagrer users/cards i en JSON-fil på disk.
// Samme datamodell som schema.sql -> bytt enkelt ut med en ekte Postgres/Mongo-klient senere.
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

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
    console.error(`Corrupt db file ${DB_FILE}, resetting to seed data:`, err.message);
    const initial = seedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function save(data) {
  const tmp = DB_FILE + '.tmp';
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('Failed to persist db state:', err.message);
    try { fs.unlinkSync(tmp); } catch (_) { /* cleanup best-effort */ }
    throw err;
  }
}

let state = load();

// Liten wrapper som gir samme følelse som å snakke med en ekte database.
const db = {
  users: {
    findByEmail(email) {
      return state.users.find((u) => u.email === email.toLowerCase());
    },
    findById(id) {
      return state.users.find((u) => u.id === id);
    },
    create(user) {
      state.users.push(user);
      save(state);
      return user;
    },
  },
  cards: {
    all() {
      return state.cards;
    },
    findById(id) {
      return state.cards.find((c) => c.id === id);
    },
    create(card) {
      state.cards.push(card);
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
  },
};

module.exports = db;
