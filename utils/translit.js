const settings = require('./settings');

let translitMap = null;

function buildTranslitMap() {
  const latin = settings.get('LatinSymbolSet');
  const cyrillic = settings.get('CyrillicSymbolSet');

  translitMap = {};
  const length = Math.min(latin.length, cyrillic.length);
  for (let i = 0; i < length; i++) {
    translitMap[latin[i]] = cyrillic[i];
  }
}

function normalizeQuery(input) {
  if (!translitMap) buildTranslitMap();

  return input
    .toUpperCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('');
}

module.exports = {
  normalizeQuery,
};
