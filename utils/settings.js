const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../res/settings');
let settingsCache = null;

function ensureSettingsFile() {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, '');
  }

  const content = fs.readFileSync(settingsPath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const requiredKeys = ['LatinSymbolSet', 'CyrillicSymbolSet', 'SearchMinLength'];
  const existingKeys = lines.map(line => line.split('=')[0].trim());

  const missingKeys = requiredKeys.filter(key => !existingKeys.includes(key));
  if (missingKeys.length > 0) {
    const additions = missingKeys.map(k => `${k}=`).join('\n');
    fs.appendFileSync(settingsPath, '\n' + additions + '\n');
  }
}

function loadSettings() {
  ensureSettingsFile();

  const content = fs.readFileSync(settingsPath, 'utf-8');
  settingsCache = Object.fromEntries(
    content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.includes('='))
      .map(line => {
        const [key, ...rest] = line.split('=');
        return [key.trim(), rest.join('=').trim()];
      })
  );
}

function get(key) {
  if (!settingsCache) loadSettings();
  return settingsCache[key];
}

module.exports = {
  get,
  reload: loadSettings,
  all: () => ({ ...settings }),
};