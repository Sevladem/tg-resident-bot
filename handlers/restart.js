// restart.js
const access = require('../utils/access');

module.exports = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // У майбутньому тут можна буде перезчитувати .env, заново ініціалізувати доступи, кеш і т.д.
  await bot.sendMessage(chatId, 'Перезапускаю бота...');

  // Оновимо список команд для цього користувача (як приклад)
  const commands = await access.getAvailableCommands(userId);
  if (commands.length > 0) {
    await bot.setMyCommands(commands, {
      scope: {
        type: 'chat',
        chat_id: userId,
      }
    });
  }

  await bot.sendMessage(chatId, 'Бот перезапущено.');
};
