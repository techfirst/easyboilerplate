const express = require("express");
const router = express.Router();
const {
  refreshToken,
  getUser,
  logoutUser,
} = require("../controllers/userController");

router.post("/refresh-token", refreshToken);
router.get("/getuser", getUser);
router.post("/logout", logoutUser);

module.exports = router;
