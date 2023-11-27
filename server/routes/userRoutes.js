const express = require("express");
const router = express.Router();
const {
  refreshToken,
  getUser,
  logoutUser,
  updateUserProfile,
} = require("../controllers/userController");

const { validateUpdateProfile } = require("../middleware/validate");

router.post("/refresh-token", refreshToken);
router.get("/getuser", getUser);
router.post("/logout", logoutUser);
router.post("/update", validateUpdateProfile, updateUserProfile);

module.exports = router;
