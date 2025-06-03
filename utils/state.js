const userStates = new Map();

function setUserState(userId, state) {
  userStates.set(userId, state);
}

function getUserState(userId) {
  return userStates.get(userId);
}

function clearUserState(userId) {
  userStates.delete(userId);
}

module.exports = {
  setUserState,
  getUserState,
  clearUserState,
};
