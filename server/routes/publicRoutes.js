const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyUser,
} = require("../controllers/userController");
const { check } = require("express-validator");

const registrationValidationMiddleware = [
  check("firstname").notEmpty().withMessage("Firstname is required"),
  check("lastname").notEmpty().withMessage("Lastname is required"),
  check("email").isEmail().withMessage("Invalid email address"),
  check("password1")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

router.post("/register", registrationValidationMiddleware, registerUser);
router.post("/login", loginUser);
router.get("/verify-user", verifyUser);

module.exports = router;
