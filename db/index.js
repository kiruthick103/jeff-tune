/**
 * PostgreSQL database for chat sessions and messages.
 * Falls back to in-memory when DATABASE_URL is not set (e.g. quick deploy without DB).
 */

const path = require('path');
const fs = require('fs');

let pool = null;
const memory = { sessions: [], messages: [] };

function hasDb() {
  return !!process.env.DATABASE_URL;
}

function getPool() {
  if (!hasDb()) return null;
  if (!pool) {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

async function initDb() {
  if (!hasDb()) {
    console.warn('DATABASE_URL not set. Chat history will not persist (in-memory only).');
    return true;
  }
  try {
    const client = getPool();
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    return true;
  } catch (err) {
    console.error('DB init error:', err.message);
    return false;
  }
}

async function createSession(id, title = 'New chat') {
  if (!hasDb()) {
    memory.sessions.push({ id, title, created_at: new Date() });
    return { id, title, created_at: new Date() };
  }
  const res = await getPool().query(
    'INSERT INTO chat_sessions (id, title) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET title = $2 RETURNING id, title, created_at',
    [id, title]
  );
  return res.rows[0];
}

async function updateSessionTitle(id, title) {
  if (!hasDb()) {
    const s = memory.sessions.find(s => s.id === id);
    if (s) s.title = title;
    return;
  }
  await getPool().query('UPDATE chat_sessions SET title = $1 WHERE id = $2', [title, id]);
}

async function addMessage(sessionId, role, content) {
  if (!hasDb()) {
    memory.messages.push({ session_id: sessionId, role, content });
    return;
  }
  await getPool().query(
    'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
    [sessionId, role, content]
  );
}

async function getSessions() {
  if (!hasDb()) {
    return memory.sessions.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  const res = await getPool().query(
    'SELECT id, title, created_at FROM chat_sessions ORDER BY created_at DESC'
  );
  return res.rows;
}

async function getSessionMessages(sessionId) {
  if (!hasDb()) {
    return memory.messages.filter(m => m.session_id === sessionId).map(m => ({ role: m.role, content: m.content }));
  }
  const res = await getPool().query(
    'SELECT role, content FROM messages WHERE session_id = $1 ORDER BY id ASC',
    [sessionId]
  );
  return res.rows;
}

async function sessionExists(sessionId) {
  if (!hasDb()) {
    return memory.sessions.some(s => s.id === sessionId);
  }
  const res = await getPool().query('SELECT 1 FROM chat_sessions WHERE id = $1', [sessionId]);
  return res.rows.length > 0;
}

module.exports = {
  initDb,
  createSession,
  updateSessionTitle,
  addMessage,
  getSessions,
  getSessionMessages,
  sessionExists,
  getPool,
  hasDb,
};
