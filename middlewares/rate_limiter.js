const rate_limit = require("express-rate-limit");

// 45 min cooldown after every 15 shortens
const shortenLimiter = rate_limit({
  windowMs: 45 * 60 * 1000,
  max: 15,
  message: "Rate limit exceeded: Too many shortens!",
});

// 2 hour cooldown after every 30 api requests
const apiLimiter = rate_limit({
  windowMs: 120 * 60 * 1000,
  max: 30,
  message: "Rate limit exceeded: Too many API requests!",
});

module.exports = { shortenLimiter, apiLimiter };
