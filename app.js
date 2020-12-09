const express = require("express");
const monk = require("monk");
const path = require("path");
const yup = require("yup");

const app = express();

require("dotenv").config();

const db = monk(process.env.MONGO_URI);
const port = process.env.PORT || 3000;
const urls = db.get("shortened_urls");

db.then(() => {
  console.log("Connected correctly to server");
});

app.set("view engine", "pug");
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/:id", async (req, res, next) => {
  var querry = {
    slug: req.params.id,
  };
  try {
    var url = await urls.findOne(querry);
    next();
    console.log(url.url);
    if (url) {
      return res.redirect(302, url.url);
    }
    return res.status(404);
  } catch (error) {
    return res.status(404);
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
  if (valid_url) {
      const querry_to_post = {
        url: req.body["url"],
        slug: req.body["slug"]
      };
      await urls.insert(querry_to_post);
      console.log(`New slug ("${querry_to_post["slug"]}") created for ${querry_to_post["url"]}.`);
      next();
      return res.status(200);
  } else {
      return res.status(400);
  }
});

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});