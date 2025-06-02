function recordInfo(row) {
    const number = row[5] || '—';
    const id = row[1] || '—';
    const phone1 = row[2]?.trim();
    const phone2 = row[3]?.trim();
    const phone3 = row[4]?.trim();
    const photos = Array.isArray(row[6]) ? row[6] : [];
  
    let text = `🚗 Номер авто: ${number}\n🏠 ID: ${id}`;
  
    const phoneLines = [];
    if (phone1) phoneLines.push(`📞 Телефон: ${phone1}`);
    if (phone2) phoneLines.push(`📞 Телефон: ${phone2}`);
    if (phone3) phoneLines.push(`📞 Телефон: ${phone3}`);
  
    if (phoneLines.length > 0) {
      text += '\n\n' + phoneLines.join('\n');
    } else {
      text += '\n\n❗️ УВАГА. ЗАПИС ЗНАЙДЕНО, АЛЕ НЕМАЄ ТЕЛЕФОНІВ';
    }
  
    return {
      infoText: text,
      photoUrls: photos
    };
  }
  
  module.exports = { recordInfo };