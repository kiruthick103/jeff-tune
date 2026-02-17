/**
 * Simple in-memory cache for repeated prompts.
 * Reduces API calls and improves response time for identical questions.
 */

const cache = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function cacheKey(messages, model) {
  const lastUser = messages.filter(m => m.role === 'user').pop();
  const text = lastUser ? lastUser.content : '';
  return `${model}:${hashString(text)}`;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return h.toString(36);
}

function get(messages, model) {
  const key = cacheKey(messages, model);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function set(messages, model, value) {
  const key = cacheKey(messages, model);
  cache.set(key, { value, expires: Date.now() + TTL_MS });
}

module.exports = { get, set };
