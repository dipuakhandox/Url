const express = require("express");
const monk = require("monk");
const path = require("path");
const yup = require("yup");

const app = express();

require("dotenv").config();

const db = monk(process.env.MONGO_URI);
const port = process.env.PORT || 3000;
const main_url = process.env.WEBSITE_DOMAIN
const urls = db.get("shortened_urls");

db.then(() => {
  console.log("Connected correctly to server");
});

app.set("view engine", "pug");
app.use(express.json());
app.use("/", express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  const kaka = "kek.cx";
  res.render("index", {title: `Shortify | ${kaka}`, website: main_url});
});

app.use("/:id?", async (req, res, next) => {
  var querry = {
    slug: req.params.id,
  };
  if (req.params.id == "shorten") {
    next();
  }
  try {
    var url = await urls.findOne(querry);
    next();
    if (url !== null) {
      console.log(url.url);
      return res.redirect(302, url.url);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.log(`id shit error ${error}`);  // HTTP_HEADERS_SENT Error
  }
});

const schema = yup.object().shape({
  url: yup.string().required().url().trim(),
  slug: yup.string().trim().matches(/^[a-z0-9_]+(-[a-z0-9_]+)*$/i),
})

app.post("/shorten", async (req, res, next) => {
  const valid_url = await schema.isValid({
    url: req.body["url"],
    slug: req.body["slug"]
  });
  next();
  console.log(valid_url);
  const querry_to_check = { slug: req.body["slug"] };
  try {
    if (valid_url && await urls.findOne(querry_to_check) == null) {
        const querry_to_post = {
          url: req.body["url"],
          slug: req.body["slug"]
        };
        await urls.insert(querry_to_post);
        console.log(`New slug ("${querry_to_post["slug"]}") created for ${querry_to_post["url"]}.`);
        return res.json(querry_to_post);
    } else {
        return res.status(400).end("Slug isn't valid or already exists.");
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});