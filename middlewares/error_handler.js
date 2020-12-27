const logger = require("./logger");

require("dotenv").config();

const production = process.env.NODE_ENV;

function generic(error, req, res, next) {
  try {
    logger.log({
      level: "error",
      message: error,
    });
    if (production === "development") {
      console.log(error);
      return res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    } else {
      return res.sendStatus(500);
    }
  } catch (err) {
    console.error(err);
    logger.log({
      level: "error",
      message: err,
    });
  }
}

module.exports = generic;
