const access = require('../utils/access');

module.exports = (bot, msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  async function askForPhone() {
    return bot.sendMessage(chatId, 'Будь ласка, надішліть свій номер телефону, використовуючи кнопку нижче.', {
      reply_markup: {
        keyboard: [[{ text: 'Поділитися номером телефону', request_contact: true }]],
        one_time_keyboard: true,
        resize_keyboard: true,
      }
    });
  }

  async function handleStart() {
    const authorized = await access.isAuthorized(userId);
    if (authorized) {
      await updateCommandsForUser(bot, userId);
      await bot.sendMessage(chatId, 'Вітаємо! Ви авторизовані.');

      const commands = await access.getAvailableCommands(userId);
      await bot.sendMessage(chatId, `Доступні команди:\n${commands.map(c => '/' + c.command).join('\n')}`);
    } else {
      // Перевірка на вільні записи
      const users = await access.loadUserData(); // тобі треба реалізувати це або викликати з db/google-provider
      const freeRowExists = users.some(row => !row[0] || row[0].trim() === '');

      if (!freeRowExists) {
        return bot.sendMessage(chatId, 'Вибачте, ліміт користувачів вичерпано. Зверніться до адміністратора.');
      }

      return askForPhone();
    }
  }

  async function updateCommandsForUser(bot, userId) {
    const commands = await access.getAvailableCommands(userId);
    if (commands.length === 0) return;

    await bot.setMyCommands(commands, {
      scope: {
        type: 'chat',
        chat_id: userId,
      }
    });
  }

  if (msg.contact && msg.contact.phone_number) {
    let phone = msg.contact.phone_number.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '38' + phone;
  
    access.registerByPhone(phone, userId).then(result => {
      if (result) {
        updateCommandsForUser(bot, userId);
        bot.sendMessage(chatId, 'Дякуємо! Ви успішно зареєстровані. Можна користуватись ботом.', {
          reply_markup: {
            remove_keyboard: true
          }
        });
      } else {
        bot.sendMessage(chatId, 'Вибачте, але ваш номер телефону не знайдено в базі. Зверніться до адміністратора.', {
          reply_markup: {
            remove_keyboard: true
          }
        });
      }
    }).catch(() => {
      bot.sendMessage(chatId, 'Сталася помилка при реєстрації. Спробуйте пізніше.', {
        reply_markup: {
          remove_keyboard: true
        }
      });
    });
  } else {
    // Просто стартова команда
    handleStart();
  }

};


