const express = require("express");
const monk = require("monk");
const path = require("path");
const helmet = require("helmet");
const api = require("./routes/api");
const logger = require("./middlewares/logger");
const error_handler = require("./middlewares/error_handler");

const app = express();

require("dotenv").config();

const port = process.env.PORT || 3000;
const main_url = process.env.WEBSITE_DOMAIN;

// Setting up the database connection
const db = monk(process.env.MONGO_URI);
const urls = db.get("shortened_urls");

db.then(() => {
  console.log("Connected correctly to server");
});

app.set("view engine", "pug");

/* Saving the db connection to a request variable to use it
elsewhere in the project */
app.use((req, res, next) => {
  req.db = urls;
  next();
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Some basic security
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// The contents of the public folder is served under assets
app.use("/assets", express.static(path.join(__dirname, "public")));

// Making the favicon accessible on root level
// Modern browsers load it automatically this way
app.use("/", express.static(path.join(__dirname, "public/favicons")));

// Declaring the API route
app.use("/api/", api);

// Index Page
app.get("/", (req, res) => {
  const kaka = "kek.cx";
  res.render("index", { title: `Shortify | ${kaka}`, website: main_url });
});

// Slug Listener
app.use("/:id?", async (req, res, next) => {
  var querry = {
    slug: req.params.id,
  };
  if (req.params.id == "shorten") {
    next();
  } else {
    try {
      var url = await urls.findOne(querry);
      if (url !== null) {
        var visits = url.visits;
        if (url.visits == undefined) {
          visits = 1;
        } else {
          visits++;
        }
        console.log(visits);
        await urls.findOneAndUpdate(querry, {
          $set: { visits: visits },
        });
        logger.log({
          level: "info",
          message: `Requested URL (${url.url}) from slug: ${querry.slug}`,
        });
        return res.redirect(302, url.url);
      } else {
        error_handler.not_found(req, res, next);
      }
    } catch (error) {
      next(error);
    }
  }
});

// Main Error Handler
app.use((error, req, res, next) => {
  error_handler.generic(error, req, res, next);
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
