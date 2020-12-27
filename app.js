const express = require("express");
const monk = require("monk");
const path = require("path");
const api = require("./routes/api");
const logger = require("./middlewares/logger");
const error_handler = require("./middlewares/error_handler");

const app = express();

require("dotenv").config();

const db = monk(process.env.MONGO_URI);
const port = process.env.PORT || 3000;
const main_url = process.env.WEBSITE_DOMAIN;
const urls = db.get("shortened_urls");

db.then(() => {
  console.log("Connected correctly to server");
});

app.set("view engine", "pug");
app.use((req, res, next) => {
  req.db = urls;
  next();
});
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/api/", api);

app.get("/", (req, res) => {
  const kaka = "kek.cx";
  res.render("index", { title: `Shortify | ${kaka}`, website: main_url });
});

app.use("/:id?", async (req, res, next) => {
  var querry = {
    slug: req.params.id,
  };
  if (req.params.id == "shorten") {
    next();
  } else {
    try {
      var url = await urls.findOne(querry);
      next();
      if (url !== null) {
        console.log(url.url);
        logger.log({level: "info", message: `Requested URL (${url.url}) from slug: ${querry.slug}`});
        return res.redirect(302, url.url);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      next(error);
    }
  }
});

app.use((error, req, res, next) => {
  error_handler.generic(error, req, res, next);
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
