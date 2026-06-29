require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./src/routes/auth');
const cardRoutes = require('./src/routes/cards');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json({ limit: '100kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'For mange forsøk. Prøv igjen om 15 minutter.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

app.get('/api/stats', (req, res) => {
  const db = require('./src/db');
  res.json(db.cards.stats());
});

app.use(express.static(path.join(__dirname, 'public')));

// SPA-fallback: returner index.html for alle ikke-API-ruter
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('[server]', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Noe gikk galt på serveren.' });
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[server] uncaughtException:', err);
  process.exit(1);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Vibe Cards server kjører på http://localhost:${PORT}`);
  });
}

module.exports = app;
