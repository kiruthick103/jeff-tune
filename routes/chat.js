/**
 * POST /api/chat - OpenRouter proxy with caching, validation, and DB persistence.
 * GET /api/sessions - List chat sessions.
 * GET /api/sessions/:id - Get messages for a session.
 */

const express = require('express');
const router = express.Router();
const openrouter = require('../services/openrouter');
const cache = require('../utils/cache');
const db = require('../db');
const { validateChatBody } = require('../utils/middleware');

function generateSessionId() {
  return 's' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

router.post('/chat', validateChatBody, async (req, res) => {
  const { message, history, model, session_id: sessionId } = req.body;
  const messages = [...history, { role: 'user', content: message }];
  const selectedModel = openrouter.selectModel(message, model);

  let sid = sessionId;
  const isNewSession = !sid || sid.length === 0;

  try {
    if (isNewSession) {
      sid = generateSessionId();
      const title = message.slice(0, 40) || 'New chat';
      await db.createSession(sid, title);
    }

    await db.addMessage(sid, 'user', message);

    const cached = cache.get(messages, selectedModel);
    let reply;
    if (cached) {
      reply = cached;
    } else {
      reply = await openrouter.chat(message, history, model);
      cache.set(messages, selectedModel, reply);
    }

    await db.addMessage(sid, 'assistant', reply);
    const title = message.slice(0, 40) || 'New chat';
    await db.updateSessionTitle(sid, title);

    res.json({ reply, session_id: sid, cached: !!cached });
  } catch (err) {
    const status = err.status || 500;
    const msg = err.message || 'AI request failed. Please try again.';
    res.status(status >= 400 ? status : 500).json({ error: msg });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await db.getSessions();
    res.json(sessions.map(s => ({ id: s.id, title: s.title, created_at: s.created_at })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load sessions.' });
  }
});

router.get('/sessions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db.sessionExists(id);
    if (!exists) return res.status(404).json({ error: 'Session not found.' });
    const messages = await db.getSessionMessages(id);
    res.json(messages.map(m => ({ role: m.role, content: m.content })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load session.' });
  }
});

router.get('/models', (req, res) => {
  res.json({
    default: openrouter.MODELS.general,
    options: [
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini (recommended)' },
      { id: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      { id: 'google/gemma-3-4b-it:free', label: 'Gemma 3 4B (free)' },
      { id: 'qwen/qwen3-4b:free', label: 'Qwen3 4B (free)' },
    ],
  });
});

module.exports = router;
