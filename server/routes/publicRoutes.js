const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const {
  validateForgotPassword,
  validateResetPassword,
  validateRegistration,
  validateLogin,
} = require("../middleware/validate");

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/verify-user", verifyUser);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

module.exports = router;
