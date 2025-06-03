// utils/logger.js

const db = require('../db/db');

async function logEvent({ user, action, query, result }) {
  const timestamp = new Date().toISOString();
  const userId = user.id;
  const userName = user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const row = [timestamp, userId, userName, action, query || '', result || ''];

  try {
    await db.addLog(row);
  } catch (err) {
    console.error('Не вдалося записати лог:', err);
  }
}

module.exports = {
  logEvent,
};