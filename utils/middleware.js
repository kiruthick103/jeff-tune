/**
 * Request validation and sanitization.
 */

const MAX_MESSAGE_LENGTH = 16000;
const MAX_HISTORY_LENGTH = 50;

function sanitize(text) {
  if (typeof text !== 'string') return '';
  return text.slice(0, MAX_MESSAGE_LENGTH).trim();
}

function validateChatBody(req, res, next) {
  const { message, history = [], model } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid message.' });
  }
  req.body.message = sanitize(message);
  if (!Array.isArray(history)) {
    req.body.history = [];
  } else {
    req.body.history = history.slice(-MAX_HISTORY_LENGTH).map(m => ({
      role: m.role === 'user' || m.role === 'assistant' ? m.role : 'user',
      content: sanitize(m.content || ''),
    })).filter(m => m.content.length > 0);
  }
  req.body.model = typeof model === 'string' && model.length > 0 ? model : null;
  next();
}

module.exports = { validateChatBody, sanitize };
