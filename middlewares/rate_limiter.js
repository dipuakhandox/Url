const rate_limit = require("express-rate-limit");
const slow_down = require("express-slow-down");

// 45 min cooldown after every 15 shortens
const shortenLimiter = rate_limit({
  windowMs: 45 * 60 * 1000,
  max: 15,
  message: "Rate limit exceeded: Too many shortens!",
});

const shortenSlowdown = slow_down({
  windowsMs: 45 * 60 * 1000,
  delayAfter: 5,
  delayMs: 1000,
});

// 2 hour cooldown after every 30 api requests
const apiLimiter = rate_limit({
  windowMs: 120 * 60 * 1000,
  max: 30,
  message: "Rate limit exceeded: Too many API requests!",
});

const apiSlowdown = slow_down({
  windowsMs: 120 * 60 * 1000,
  delayAfter: 20,
  delayMs: 1000,
});

module.exports = { shortenLimiter, apiLimiter, shortenSlowdown, apiSlowdown };
