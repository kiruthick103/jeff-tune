/**
 * OpenRouter API client with smart model routing and retry logic.
 */

const SYSTEM_PROMPT = 'You are Jeff Tune-1 Pro, an advanced AI assistant designed to provide accurate, structured, and helpful responses. Always prioritize correctness and clarity.';

// Model categories for smart routing
const MODELS = {
  general: 'openai/gpt-4o-mini',
  coding: 'anthropic/claude-3.5-sonnet',
  creative: 'google/gemini-2.0-flash-001',
};

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 60000;
const MAX_RETRIES = 2;

function selectModel(userMessage, requestedModel) {
  if (requestedModel && requestedModel.length > 0) {
    return requestedModel;
  }
  const lower = (userMessage || '').toLowerCase();
  if (/\b(code|coding|programming|function|bug|script|api|syntax)\b/.test(lower)) {
    return MODELS.coding;
  }
  if (/\b(write|story|creative|poem|fiction|narrative)\b/.test(lower)) {
    return MODELS.creative;
  }
  return MODELS.general;
}

async function chatWithRetry(options, retries = MAX_RETRIES) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in .env');
  }

  const { messages, model } = options;
  const body = {
    model,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 2048,
    temperature: 0.7,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      let err = new Error(errText || `OpenRouter error: ${res.status}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const choice = data.choices && data.choices[0];
    if (!choice || !choice.message || typeof choice.message.content !== 'string') {
      throw new Error('Invalid response from OpenRouter');
    }
    return choice.message.content;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (retries > 0 && (err.status === 429 || err.status >= 500)) {
      await new Promise(r => setTimeout(r, 1000));
      return chatWithRetry(options, retries - 1);
    }
    throw err;
  }
}

async function chat(message, history = [], requestedModel = null) {
  const model = selectModel(message, requestedModel);
  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  return chatWithRetry({ messages, model });
}

module.exports = {
  chat,
  selectModel,
  MODELS,
  SYSTEM_PROMPT,
};
