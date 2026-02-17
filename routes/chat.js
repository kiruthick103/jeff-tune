/**
 * POST /api/chat - OpenRouter proxy with caching and validation.
 */

const express = require('express');
const router = express.Router();
const openrouter = require('../services/openrouter');
const cache = require('../utils/cache');
const { validateChatBody } = require('../utils/middleware');

router.post('/chat', validateChatBody, async (req, res) => {
  const { message, history, model } = req.body;
  const messages = [...history, { role: 'user', content: message }];
  const selectedModel = openrouter.selectModel(message, model);

  try {
    const cached = cache.get(messages, selectedModel);
    if (cached) {
      return res.json({ reply: cached, cached: true });
    }

    const reply = await openrouter.chat(message, history, model);
    cache.set(messages, selectedModel, reply);
    res.json({ reply, cached: false });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'AI request failed. Please try again.';
    res.status(status >= 400 ? status : 500).json({ error: message });
  }
});

router.get('/models', (req, res) => {
  res.json({
    default: openrouter.MODELS.general,
    options: [
      { id: openrouter.MODELS.general, label: 'General (GPT-4o mini)' },
      { id: openrouter.MODELS.coding, label: 'Coding (Claude 3.5 Sonnet)' },
      { id: openrouter.MODELS.creative, label: 'Creative (Gemini 2.0 Flash)' },
    ],
  });
});

module.exports = router;
