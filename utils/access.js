const db = require('../db/db');

function normalizePhone(phone) {
  return phone.replace(/^\+/, ''); // прибирає + на початку, якщо є
}

async function isAuthorized(userId) {
  const user = await db.getUserById(userId);
  return !!user;
}

async function getUserPermissions(userId) {
  return db.getPermissions(userId);
}

async function registerByPhone(phone, userId) {
  const normalizedUserPhone = normalizePhone(phone);
  const result = await db.getUserByPhone(normalizedUserPhone);
  if (!result) return null;
  await db.setTelegramId(result.index, userId);
  return true;
}

// Логіка формування команд залежно від прав
async function getAvailableCommands(userId) {
  const perms = await getUserPermissions(userId);
  if (!perms) return [];

  const commands = [];
  if (perms.canAdd) commands.push({ command: 'add', description: 'Додати запис' });
  if (perms.canEdit) commands.push({ command: 'edit', description: 'Редагувати запис' });
  if (perms.canDelete) commands.push({ command: 'delete', description: 'Видалити запис' });
  if (perms.canRestart) commands.push({ command: 'restart', description: 'Перезапустити бота' });

  commands.unshift({ command: 'search', description: 'Пошук' });
  //commands.unshift({ command: 'start', description: 'Почати' });

  return commands;
}

async function loadUserData() {
  return db.listUsers();
}

module.exports = {
  isAuthorized,
  getUserPermissions,
  registerByPhone,
  getAvailableCommands,
  loadUserData,
};
