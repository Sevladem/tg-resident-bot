require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const access = require('./utils/access');

// Ініціалізуємо бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Обробники
const startHandler = require('./handlers/start');
searchModule = require('./handlers/search');
const addHandler = require('./handlers/add');
const editHandler = require('./handlers/edit');
const deleteHandler = require('./handlers/delete');
const restartHandler = require('./handlers/restart'); 

// ================================
// Обробка текстових повідомлень
// ================================

bot.on('message', async (msg) => {
  const text = msg.text;
  const userId = msg.from.id;

  if (text === '/start' || msg.contact) {
    return startHandler(bot, msg);
  }

  const authorized = await access.isAuthorized(userId);
  if (!authorized) {
    return bot.sendMessage(msg.chat.id, 'Вибачте, ви не маєте доступу до цього функціоналу.');
  }

  // Обробка інших команд
  switch (text) {
    case '/search':
      return searchModule.searchHandler(bot, msg);
    case '/add':
      return access.getUserPermissions(userId).then(perms => {
        if (perms.canAdd) return addHandler(bot, msg);
        else return bot.sendMessage(msg.chat.id, 'У вас немає доступу до цієї команди.');
      });
    case '/edit':
      return access.getUserPermissions(userId).then(perms => {
        if (perms.canEdit) return editHandler(bot, msg);
        else return bot.sendMessage(msg.chat.id, 'У вас немає доступу до цієї команди.');
      });
    case '/delete':
      return access.getUserPermissions(userId).then(perms => {
        if (perms.canDelete) return deleteHandler(bot, msg);
        else return bot.sendMessage(msg.chat.id, 'У вас немає доступу до цієї команди.');
      });
    case '/restart':
      return access.getUserPermissions(userId).then(perms => {
        if (perms.canRestart) return restartHandler(bot, msg);
        else return bot.sendMessage(msg.chat.id, 'У вас немає доступу до цієї команди.');
      });
    default:
      return searchModule.searchHandler(bot, msg);
  }

});

bot.on('callback_query', async (callbackQuery) => {
  const data = callbackQuery.data;
  try {
    if (data.startsWith('car_info_')) {
      // Перенаправляємо callback до модуля пошуку
      await searchModule.handleCallbackQuery(bot, callbackQuery);
    } else if (data.startsWith('otherPrefix_')) {
      // Перенаправляємо callback до іншого модуля
      //await otherModule.handleCallbackQuery(bot, callbackQuery);
    } else {
      await bot.answerCallbackQuery(callbackQuery.id, { text: 'Невідома дія.' });
    }
  } catch (err) {
    console.error('Error handling callback query:', err);
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Сталася помилка.' });
  }
});
