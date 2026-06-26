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

// API-ruter
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

// Statisk frontend
app.use(express.static(path.join(__dirname, 'public')));

// Sentral feilhåndtering for uventede feil
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Noe gikk galt på serveren.' });
});

app.listen(PORT, () => {
  console.log(`Vibe Cards server kjører på http://localhost:${PORT}`);
});
