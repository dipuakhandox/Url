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
      return res.render("error.pug", {
        error_code: error.status,
        error_message: error.message,
      });
    }
  } catch (err) {
    console.error(err);
    logger.log({
      level: "error",
      message: err,
    });
  }
}

function not_found(req, res, next) {
  return res.status(404).render("error.pug", {
    error_code: 404,
    error_message: "Page not found",
  });
}

module.exports = { generic, not_found };
