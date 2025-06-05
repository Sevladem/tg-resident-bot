const { readSheet } = require('../google/google-read'); 
const { writeCell, writeRow } = require('../google/google-write'); 

const USERS_SHEET_NAME = 'users';
const LOG_SHEET_NAME = 'log';
const PHOTO_SHEET_NAME = 'photo';

async function listUsers() {
  const rows = await readSheet(USERS_SHEET_NAME);
  return rows.filter(row => row.length > 0); // фільтруємо порожні
}

async function getUserById(userId) {
  const rows = await listUsers();
  return rows.find(row => row[0] === String(userId));
}

async function getUserByPhone(phone) {
  const rows = await listUsers();
  const index = rows.findIndex(row => !row[0] && row[1] === phone);
  if (index === -1) return null;
  return { index, row: rows[index] };
}

async function setTelegramId(rowIndex, userId) {
  // Telegram ID — це колонка 0
  await writeCell(USERS_SHEET_NAME, rowIndex, 0, String(userId));
}

// Дістає дозволи конкретного юзера
async function getPermissions(userId) {
  const row = await getUserById(userId);
  if (!row) return null;

  return {
    canAdd: row[2]?.toLowerCase() === 'true',
    canEdit: row[3]?.toLowerCase() === 'true',
    canDelete: row[4]?.toLowerCase() === 'true',
    canRestart: row[5]?.toLowerCase() === 'true',
    canAddPhoto: row[6]?.toLowerCase() === 'true',
    canAddIncident: row[7]?.toLowerCase() === 'true',
  };
}

async function getPhotoByID(id) {
  const photoRows = await readSheet('photo'); // Всі рядки з таблиці фото

  const urls = [];

  for (const row of photoRows) {
    const npp = row[0]?.trim();
    const url = row[1]?.trim();

    if (!npp || !url) continue;
    if (npp === id) {
      urls.push(url);
    }
  }

  return urls;
}

// Заглушка - поки повертає всі машини, що містять query в номері (без врахування регістру)
async function searchCarByNumber(query) {
  const dataRows = await readSheet('data'); // Всі рядки з основної таблиці
  
  // Пошук по номеру авто (6-а колонка, тобто індекс 5)
  const filtered = dataRows.filter(row => {
    const number = row[5]?.toLowerCase().replace(/\s+/g, '');
    return number && number.includes(query.toLowerCase());
  });

  // Додати фото до кожного результату (в 7 колонку)
  for (const row of filtered) {
    const npp = row[0]?.trim();
    row[6] = await getPhotoByID(npp);
  }

  return filtered;

}

async function addLog(row) {
  await writeRow(LOG_SHEET_NAME, row);
}

async function addPhoto(row) {
  const timestamp = new Date().toISOString(); // або .toLocaleString() для читабельнішого формату
  const rowWithTimestamp = [timestamp, ...row];
  await writeRow(PHOTO_SHEET_NAME, rowWithTimestamp);
}

module.exports = {
  listUsers,
  getUserById,
  getUserByPhone,
  setTelegramId,
  getPermissions,
  searchCarByNumber,
  addLog,
  getPhotoByID,
  addPhoto,
};
