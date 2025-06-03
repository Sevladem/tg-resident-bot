const db = require('../db/db');
const { getUserPermissions } = require('../utils/access');
const { sendCarInfo } = require('../utils/sendCarInfo');

const waitingForSearchInput = new Set(); // юзери, що вводять текст пошуку
const searchCache = new Map(); // chatId -> масив результатів

async function doSearch(bot, msg ) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  if (!msg.text || typeof msg.text !== 'string') {
    await bot.sendMessage(msg.chat.id, 'Підтримується лише текстовий пошук.');
  return;
  }

  const query = msg.text.trim();

  if (!query) {
    return bot.sendMessage(chatId, 'Порожній запит, спробуйте ще раз.');
  }

  await bot.sendChatAction(chatId, 'typing');
  //await new Promise(resolve => setTimeout(resolve, 500));
  const results = await db.searchCarByNumber(query);

  if (!results.length) {
    return bot.sendMessage(chatId, 'За вашим запитом нічого не знайдено.');
  }

  searchCache.set(chatId, results);

  const perms = await getUserPermissions(userId);

  if (results.length === 1) {
    const row = results[0];
    return sendCarInfo(bot, chatId, row, perms);
  }

  // Якщо декілька записів — формуємо кнопки
  const inlineKeyboard = results.map((row, i) => {
    const carNumber = row[5] || 'Немає номера';
    return [{ text: `${i + 1}. ${carNumber}`, callback_data: `car_info_${i}` }];
  });

  return bot.sendMessage(chatId, 'Знайдено декілька записів. Оберіть номер:', {
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    }
  });
}

async function searchHandler(bot, msg) {
  
  const userId = msg.from.id;

  if (msg.text === '/search') {
    waitingForSearchInput.add(userId);
    return bot.sendMessage(chatId, 'Введіть номер повністю, або частково без пробілів');
  }

  if (waitingForSearchInput.has(userId)) {
    waitingForSearchInput.delete(userId);
  }

  return doSearch(bot, msg);
}

// Функція для обробки callback_query, викликається з головного модуля
async function handleCallbackQuery(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (data.startsWith('car_info_')) {
    const index = Number(data.split('_')[2]);
    const results = searchCache.get(chatId);

    if (!results || !results[index]) {
      await bot.answerCallbackQuery(callbackQuery.id, { text: 'Інформація недоступна або застаріла.' });
      return;
    }

    const row = results[index];
    const perms = await getUserPermissions(userId);
    //await bot.deleteMessage(chatId, messageId);
    await sendCarInfo(bot, chatId, row, perms);

    return bot.answerCallbackQuery(callbackQuery.id);
  }

  if (data.startsWith('morePhotos_')) {
    const id = data.split('_')[1];
    const urls = await db.getPhotoByID(id);
    if (!urls || urls.length <= 1) {
      await bot.sendMessage(chatId, 'Більше фото немає.');
      return;
    }

    // Всі фото, крім першого
    const additionalUrls = urls.slice(1);

    // Формуємо масив для надсилання
    const mediaGroup = additionalUrls.map((url, index) => ({
      type: 'photo',
      media: url,
     ...(index === 0 ? { caption: '📸 Додаткові фото авто' } : {}),
    }));

    await bot.sendMediaGroup(chatId, mediaGroup);

    return bot.answerCallbackQuery(callbackQuery.id);
  }

}

module.exports = { searchHandler, handleCallbackQuery };
