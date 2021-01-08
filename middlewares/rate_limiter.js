const rate_limit = require("express-rate-limit");
const error_handler = require("./error_handler");

// 45 min cooldown after every 15 shortens
const shortenLimiter = rate_limit({
  windowMs: 45 * 60 * 1000,
  max: 15,
  handler: function (req, res) {
    error_handler.rate_limiting(req, res);
  },
});

// 2 hour cooldown after every 30 api requests
const apiLimiter = rate_limit({
  windowMs: 120 * 60 * 1000,
  max: 30,
  handler: function (req, res) {
    error_handler.rate_limiting(req, res);
  },
});

module.exports = { shortenLimiter, apiLimiter };
