require('dotenv').config();
const express = require('express');
const path = require('path');

const authRoutes = require('./src/routes/auth');
const cardRoutes = require('./src/routes/cards');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API-ruter
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

// Statisk frontend
app.use(express.static(path.join(__dirname, 'public')));

// Sentral feilhåndtering for uventede feil
app.use((err, req, res, _next) => {
  console.error('Unhandled error in request:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Noe gikk galt på serveren.' });
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception, shutting down:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Vibe Cards server kjører på http://localhost:${PORT}`);
});
