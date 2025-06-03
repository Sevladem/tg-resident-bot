require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const access = require('./utils/access');
const { logEvent } = require('./utils/logger');
const { getUserState, clearUserState } = require('./utils/state');
addModule = require('./handlers/add');

// Ініціалізуємо бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Обробники
const startHandler = require('./handlers/start');
searchModule = require('./handlers/search');
addModule = require('./handlers/add'); 
const editHandler = require('./handlers/edit');
const deleteHandler = require('./handlers/delete');
const restartHandler = require('./handlers/restart'); 

// ================================
// Обробка текстових повідомлень
// ================================

bot.on('message', async (msg) => {
  const user = msg.from;
  const userId = user.id;
  const text = msg.text;
  
  await logEvent({
    user,
    action: 'message',
    query: text,
    result: '',
  });

  const state = getUserState(userId);

  if (state) {
    await addModule.handleUserInput(bot, msg, state);
    clearUserState(userId);
    return;
  }

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
  const user = callbackQuery.from;
  const data = callbackQuery.data;

  await logEvent({
    user,
    action: 'callback_query',
    query: data,
    result: '',
  });

  try {
    if (data.startsWith('car_info_')) {
      await searchModule.handleCallbackQuery(bot, callbackQuery);
    } else if (data.startsWith('addPhoto_') || data.startsWith('addIncident_')) {
        await addModule.handleCallbackQuery(bot, callbackQuery);
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
