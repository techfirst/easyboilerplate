const express = require("express");
const router = express.Router();
const { webhook } = require("../controllers/stripeController");

router.post(
  "/stripewebhook",
  express.raw({ type: "application/json" }),
  webhook
);

module.exports = router;
