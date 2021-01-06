const express = require("express");
const yup = require("yup");
const logger = require("../middlewares/logger");

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
    url: req.body.url,
    slug: req.body.slug,
  });
  req.valid_url = valid_url;
  next();
};

var slug_insert = async function (req, res, next) {
  const urls = req.db;
  console.log(req.valid_url);
  console.log(req.body.url);
  try {
    if (
      req.valid_url &&
      (await urls.findOne({
        slug: req.body.slug,
      })) == null
    ) {
      const querry_to_post = {
        url: req.body.url,
        slug: req.body.slug,
      };
      await urls.insert(querry_to_post);
      console.log(
        `New slug ("${querry_to_post["slug"]}") created for ${querry_to_post["url"]}.`
      );
      logger.log({
        level: "info",
        message: `New slug created: ${querry_to_post["slug"]} --> ${querry_to_post["url"]}`,
      });
      req.querry_to_post = querry_to_post;
      next();
    } else {
      return res.status(400).end("Slug isn't valid or already exists.");
    }
  } catch (error) {
    next(error);
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

router
  .route("/total")
  // Checks all the shortened URLs and returns the total number of them.
  .get(async (req, res, next) => {
    try {
      const total_num = await req.db.count();
      return res.json({ total: total_num });
    } catch (error) {
      next(error);
    }
  })
  // Checks the number of a specific URL.
  .post(async (req, res, next) => {
    try {
      const url_toCount = req.body["url"];
      if (url_toCount) {
        const total_num = await req.db.count({ url: url_toCount });
        return res.json({ total: total_num });
      } else {
        return res.status(400).send("Include a URL in your request.");
      }
    } catch (error) {
      next(error);
    }
  });

router.post("/shortened", async (req, res, next) => {
  try {
    const url_toCount = req.body["url"];
    if (url_toCount) {
      const slugs = [];
      await req.db
        .find({ url: url_toCount })
        .each((slug, { close, pause, resume }) => {
          slugs.push(slug.slug);
        });
      return res.json({ slugs });
    } else {
      return res.status(400).send("Include a URL in your request.");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
