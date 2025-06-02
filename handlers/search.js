const db = require('../db/db');
const { recordInfo } = require('../utils/format');

const waitingForSearchInput = new Set(); // юзери, що вводять текст пошуку
const searchCache = new Map(); // chatId -> масив результатів

async function doSearch(bot, chatId, query) {
  if (!query) {
    return bot.sendMessage(chatId, 'Порожній запит, спробуйте ще раз.');
  }

  const results = await db.searchCarByNumber(query);

  if (!results.length) {
    return bot.sendMessage(chatId, 'За вашим запитом нічого не знайдено.');
  }

  searchCache.set(chatId, results);

  if (results.length === 1) {
    const row = results[0];
    const { infoText, photoUrls } = recordInfo(row);

    if (photoUrls.length > 0) {
        // Всі фото, крім останнього — без підпису
        for (let i = 0; i < photoUrls.length - 1; i++) {
          await bot.sendPhoto(chatId, photoUrls[i]);
        }
      
        // Останнє фото — з підписом
        await bot.sendPhoto(chatId, photoUrls[photoUrls.length - 1], { caption: infoText });
    } else {
      return bot.sendMessage(chatId, infoText + '\n\nбез фото');
    }
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
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Якщо це callback_query, Telegram передає окремо, тому тут перевірка не потрібна.
  // Але якщо треба, можна обробляти callback_query у головному файлі.

  if (msg.text === '/search') {
    waitingForSearchInput.add(userId);
    return bot.sendMessage(chatId, 'Введіть номер повністю, або частково без пробілів');
  }

  if (waitingForSearchInput.has(userId)) {
    waitingForSearchInput.delete(userId);
    const query = msg.text.trim();
    return doSearch(bot, chatId, query);
  }

  // Пошук одразу по тексту повідомлення
  const query = msg.text.trim();
  return doSearch(bot, chatId, query);
}

// Функція для обробки callback_query, викликається з головного модуля
async function handleCallbackQuery(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  if (!data.startsWith('car_info_')) return;

  const index = Number(data.split('_')[2]);
  const results = searchCache.get(chatId);

  if (!results || !results[index]) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Інформація недоступна або застаріла.' });
    return;
  }

  const row = results[index];
  const { infoText, photoUrls } = recordInfo(row);

  if (photoUrls.length > 0) {
        await bot.deleteMessage(chatId, messageId);
        // Всі фото, крім останнього — без підпису
        for (let i = 0; i < photoUrls.length - 1; i++) {
          await bot.sendPhoto(chatId, photoUrls[i]);
        }
      
        // Останнє фото — з підписом
        await bot.sendPhoto(chatId, photoUrls[photoUrls.length - 1], { caption: infoText });
  } else {
    await bot.editMessageText(infoText + '\n\nбез фото', {
      chat_id: chatId,
      message_id: messageId,
    });
  }

  await bot.answerCallbackQuery(callbackQuery.id);
}

module.exports = { searchHandler, handleCallbackQuery };

