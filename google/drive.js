const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { getAuthClient } = require('./google-auth');
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;


async function uploadToDrive(filePath, fileName) {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: 'image/jpeg',
      parents: [folderId],
    },
    media: {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(filePath),
    },
  });

  const fileId = res.data.id;

  // Робимо файл видимим для всіх (опціонально)
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Генеруємо публічне посилання
  const link = `https://drive.google.com/uc?id=${fileId}`;
  return link;
}

module.exports = { uploadToDrive };