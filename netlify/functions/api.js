const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import existing routes and services
const chatRouter = require('../../routes/chat');
const db = require('../../db');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({ origin: true }));
app.use(express.json({ limit: '256kb' }));
app.use('/api', limiter);

// Use existing chat routes
app.use('/api', chatRouter);

// Initialize database
async function init() {
  try {
    await db.initDb();
  } catch (err) {
    console.warn('Database init failed. Chat history may not persist.');
  }
}

// Initialize on cold start
init();

module.exports.handler = serverless(app);
