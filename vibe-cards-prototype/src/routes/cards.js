const express = require('express');
const { nanoid } = require('nanoid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const MOODS = ['rolig', 'energisk', 'kreativ', 'nostalgisk', 'fokusert'];

function validateCardInput(body, { partial = false } = {}) {
  const errors = [];
  const { title, mood, color, description, tags } = body;

  if (!partial || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Tittel er påkrevd.');
    } else if (title.length > 80) {
      errors.push('Tittel kan ikke være lengre enn 80 tegn.');
    }
  }
  if (!partial || mood !== undefined) {
    if (!MOODS.includes(mood)) {
      errors.push(`Mood må være en av: ${MOODS.join(', ')}.`);
    }
  }
  if (!partial || color !== undefined) {
    if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      errors.push('Color må være en gyldig hex-verdi, f.eks. #7FB3A8.');
    }
  }
  if (description !== undefined && typeof description !== 'string') {
    errors.push('Beskrivelse må være tekst.');
  }
  if (tags !== undefined && !Array.isArray(tags)) {
    errors.push('Tags må være en liste med tekst.');
  }

  return errors;
}

// GET /api/cards?mood=rolig - liste over alle vibe-kort, valgfritt filtrert på mood
router.get('/', (req, res) => {
  const { mood } = req.query;
  let cards = db.cards.all();
  if (mood) {
    cards = cards.filter((c) => c.mood === mood);
  }
  res.json({ cards, moods: MOODS });
});

// GET /api/cards/:id - hent ett kort
router.get('/:id', (req, res) => {
  const card = db.cards.findById(req.params.id);
  if (!card) return res.status(404).json({ error: 'Kortet finnes ikke.' });
  res.json({ card });
});

// POST /api/cards - opprett nytt kort (krever innlogging)
router.post('/', requireAuth, (req, res) => {
  const errors = validateCardInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { title, mood, color, description = '', tags = [] } = req.body;
  const now = new Date().toISOString();
  const card = db.cards.create({
    id: nanoid(),
    ownerId: req.userId,
    title: title.trim(),
    description: description.trim(),
    mood,
    color,
    tags: tags.map((t) => String(t).trim()).filter(Boolean),
    likes: [],
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json({ card });
});

// PUT /api/cards/:id - oppdater kort (kun eier)
router.put('/:id', requireAuth, (req, res) => {
  const card = db.cards.findById(req.params.id);
  if (!card) return res.status(404).json({ error: 'Kortet finnes ikke.' });
  if (card.ownerId !== req.userId) {
    return res.status(403).json({ error: 'Du kan kun redigere dine egne kort.' });
  }

  const errors = validateCardInput(req.body, { partial: true });
  if (errors.length > 0) return res.status(400).json({ errors });

  const patch = {};
  for (const field of ['title', 'description', 'mood', 'color']) {
    if (req.body[field] !== undefined) patch[field] = req.body[field];
  }
  if (req.body.tags !== undefined) {
    patch.tags = req.body.tags.map((t) => String(t).trim()).filter(Boolean);
  }

  const updated = db.cards.update(req.params.id, patch);
  res.json({ card: updated });
});

// DELETE /api/cards/:id - slett kort (kun eier)
router.delete('/:id', requireAuth, (req, res) => {
  const card = db.cards.findById(req.params.id);
  if (!card) return res.status(404).json({ error: 'Kortet finnes ikke.' });
  if (card.ownerId !== req.userId) {
    return res.status(403).json({ error: 'Du kan kun slette dine egne kort.' });
  }

  db.cards.delete(req.params.id);
  res.status(204).send();
});

// POST /api/cards/:id/like - veksle like for innlogget bruker (interaktivt element)
router.post('/:id/like', requireAuth, (req, res) => {
  const card = db.cards.findById(req.params.id);
  if (!card) return res.status(404).json({ error: 'Kortet finnes ikke.' });

  const hasLiked = card.likes.includes(req.userId);
  const likes = hasLiked
    ? card.likes.filter((id) => id !== req.userId)
    : [...card.likes, req.userId];

  const updated = db.cards.update(req.params.id, { likes });
  res.json({ card: updated, liked: !hasLiked });
});

module.exports = router;
