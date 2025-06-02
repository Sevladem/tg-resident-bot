const provider = require('./google-provider'); // або інший провайдер у майбутньому

module.exports = {
  getUserById: provider.getUserById,
  getUserByPhone: provider.getUserByPhone,
  setTelegramId: provider.setTelegramId,
  getPermissions: provider.getPermissions,
  listUsers: provider.listUsers,
  searchCarByNumber: provider.searchCarByNumber,
};
