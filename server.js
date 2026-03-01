/**
 * Jeff Tune-1 Pro - Express server
 * Serves static frontend, /api/chat, and DB-backed sessions.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const chatRouter = require('./routes/chat');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', chatRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize DB
db.initDb().catch(err => {
  console.warn('Database init failed:', err.message);
});

// Start server locally (skip on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Jeff Tune-1 Pro running at http://localhost:${PORT}`);
  });
}

module.exports = app;


