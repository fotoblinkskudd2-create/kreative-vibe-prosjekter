require('dotenv').config();
const path = require('path');
const { createApp, attachErrorHandler, startServer } = require('../shared/js/express-setup');

const authRoutes = require('./src/routes/auth');
const cardRoutes = require('./src/routes/cards');

const { app, PORT } = createApp({
  staticDir: path.join(__dirname, 'public'),
  name: 'vibe-cards',
});

// Serve shared utilities to frontend
app.use('/shared', require('express').static(path.join(__dirname, '../shared')));

// API-ruter
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

// Sentral feilhåndtering for uventede feil
attachErrorHandler(app);

startServer(app, PORT, 'Vibe Cards');
