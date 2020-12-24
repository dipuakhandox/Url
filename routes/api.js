const express = require("express");
const yup = require("yup");

const router = express.Router();

const schema = yup.object().shape({
  url: yup.string().required().url().trim(),
  slug: yup
    .string()
    .trim()
    .matches(/^[a-z0-9_]+(-[a-z0-9_]+)*$/i),
});

var slug_validator = async function (req, res, next) {
  const valid_url = await schema.isValid({
    url: req.body["url"],
    slug: req.body["slug"],
  });
  req.valid_url = valid_url;
  next();
};

var slug_insert = async function (req, res, next) {
  const urls = req.db;
  console.log(req.valid_url);
  try {
    if (
      req.valid_url &&
      (await urls.findOne({
        slug: req.body["slug"],
      })) == null
    ) {
      const querry_to_post = {
        url: req.body["url"],
        slug: req.body["slug"],
      };
      await urls.insert(querry_to_post);
      console.log(
        `New slug ("${querry_to_post["slug"]}") created for ${querry_to_post["url"]}.`
      );
      req.querry_to_post = querry_to_post;
      next();
    } else {
      return res.status(400).end("Slug isn't valid or already exists.");
    }
  } catch (error) {
    console.log(error);
  }
};

// A router for creating shortened urls
router.post(
  "/shorten",
  [slug_validator, slug_insert],
  async (req, res, next) => {
    return res.json(req.querry_to_post);
  }
);

module.exports = router;
