const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 10 * 60 * 1000; // 10 minutos

module.exports = { loginAttempts, MAX_ATTEMPTS, BLOCK_TIME };
