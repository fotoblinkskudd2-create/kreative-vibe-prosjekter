const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const db = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

// POST /api/auth/register - opprett ny bruker
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Navn, e-post og passord er påkrevd.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Passord må være minst 6 tegn.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (db.users.findByEmail(normalizedEmail)) {
      return res.status(409).json({ error: 'E-posten er allerede registrert.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = db.users.create({
      id: nanoid(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login - logg inn med e-post/passord
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-post og passord er påkrevd.' });
    }

    const user = db.users.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Feil e-post eller passord.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Feil e-post eller passord.' });
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - hent innlogget bruker basert på token
router.get('/me', requireAuth, (req, res) => {
  const user = db.users.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'Bruker finnes ikke.' });
  res.json({ user: toPublicUser(user) });
});

module.exports = router;
