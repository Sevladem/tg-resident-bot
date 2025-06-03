const { recordInfo } = require('./format');

async function sendCarInfo(bot, chatId, row, perms) {
  const { infoText, photoUrls, extraButtons } = recordInfo(row, perms);

  if (photoUrls.length > 0) {
    const mediaGroup = photoUrls.slice(0, 10).map((url) => ({
      type: 'photo',
      media: url,
    }));

    await bot.sendMediaGroup(chatId, mediaGroup);

    await bot.sendMessage(chatId, infoText, {
      reply_markup: {
        inline_keyboard: extraButtons,
      },
    });

  } else {
    // Без фото, просто опис
    await bot.sendMessage(chatId, infoText + '\n\nБез фото.', {
      reply_markup: {
        inline_keyboard: extraButtons,
      },
    });
  }
}

module.exports = { sendCarInfo };
