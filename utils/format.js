function recordInfo(record, userPermissions) {
  const [id, userId, phone1, phone2, phone3, carNumber, photoUrlsRaw] = record;
  const photoUrls = Array.isArray(photoUrlsRaw) ? photoUrlsRaw.filter(Boolean) : [];

  const lines = [];
  lines.push(`🚗 Номер авто: ${carNumber}`);
  lines.push(`🏠 ID: ${userId}`);

  const phones = [phone1, phone2, phone3].filter(Boolean);
  if (phones.length) {
    phones.forEach(phone => lines.push(`📞 Телефон: ${phone}`));
  } else {
    lines.push('❗️ УВАГА. ЗАПИС ЗНАЙДЕНО, АЛЕ НЕМАЄ ТЕЛЕФОНІВ');
  }

  const infoText = lines.join('\n');

  // Формуємо кнопки
  const extraButtons = [];

  if (userPermissions?.canAddPhoto) {
    extraButtons.push([{
      text: '📷 Додати фото',
      callback_data: `addPhoto_${id}`
    }]);
  }

  if (userPermissions?.canAddIncident) {
    extraButtons.push([{
      text: '❗️Додати інцидент',
      callback_data: `addIncident_${id}`
    }]);
  }

  return {
    infoText,
    photoUrls,
    extraButtons,
  };
}

module.exports = {
  recordInfo,
};
