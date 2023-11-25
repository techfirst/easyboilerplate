const express = require("express");
const router = express.Router();
const { refreshToken, getUser } = require("../controllers/userController");

router.post("/refresh-token", refreshToken);
router.get("/getuser", getUser);

module.exports = router;
