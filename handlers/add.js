const { downloadFile } = require('../google/telegram');
const { uploadToDrive } = require('../google/drive');
const db = require('../db/db');
const { setUserState } = require('../utils/state');

async function handleCallbackQuery(bot, callbackQuery) {
  const { data, from, message } = callbackQuery;
  const userId = from.id;

  const chatId = message.chat.id;
  const recordId = data.split('_')[1];

  if (data.startsWith('addPhoto_')) {
    await bot.answerCallbackQuery(callbackQuery.id);

    // зберігаємо стан
    setUserState(userId, { action: 'addPhoto', recordId });

    // надсилаємо запит з reply
    await bot.sendMessage(chatId, '📷 Надішліть фото для додавання до запису', {
      reply_to_message_id: message.message_id,
    });

  } else if (data.startsWith('addIncident_')) {
    await bot.answerCallbackQuery(callbackQuery.id);

    setUserState(userId, { action: 'addIncident', recordId });

    await bot.sendMessage(chatId, '📝 Напишіть опис інциденту', {
      reply_to_message_id: message.message_id,
    });
  }
}

async function handleUserInput(bot, msg, state) {
  const { action, recordId } = state;
  const userId = msg.from.id;

  if (action === 'addPhoto') {
    const photo = msg.photo?.at(-1); // найкраща якість
    
    if (!photo) {
      return bot.sendMessage(msg.chat.id, '❗️ Будь ласка, надішліть саме фото.');
    }

    const success = await savePhoto(recordId, photo.file_id, userId, bot);

    if (success) {
      await bot.sendMessage(msg.chat.id, '✅ Фото збережено!');
    } else {
      await bot.sendMessage(msg.chat.id, '❌ Не вдалося зберегти фото.');
    }
  }

  if (action === 'addIncident') {
    const text = msg.text?.trim();
    if (!text) {
      return bot.sendMessage(msg.chat.id, '❗️ Будь ласка, надішліть саме текст.');
    }

    // TODO: зберегти інцидент у Google Sheets (лист incidents, колонка з recordId і текст)

    await bot.sendMessage(msg.chat.id, '✅ Інцидент збережено!');
  }
}


async function savePhoto(recordId, fileId, userId, bot) {
  try {
    // 1. Завантажуємо файл з Telegram
    const localPath = await downloadFile(fileId, bot.token);

    // 2. Завантажуємо на Google Drive
    const fileName = `photo_${recordId}_${Date.now()}.jpg`;
    const driveUrl = await uploadToDrive(localPath, fileName);

    // 3. Додаємо запис у Google Sheets
    await db.addPhoto([recordId, driveUrl, userId]);

    return true;
  } catch (err) {
    console.error('❌ Помилка збереження фото:', err);
    return false;
  }
}


module.exports = {
  handleCallbackQuery,
  handleUserInput,
};
