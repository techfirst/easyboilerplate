const { body, validationResult, check } = require("express-validator");

const validateForgotPassword = [
  body("email").isEmail().withMessage("Invalid e-mail format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateResetPassword = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("token").not().isEmpty().withMessage("Token is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateRegistration = [
  check("firstname").notEmpty().withMessage("Firstname is required"),
  check("lastname").notEmpty().withMessage("Lastname is required"),
  check("email").isEmail().withMessage("Invalid email address"),
  check("password1")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid e-mail format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateForgotPassword,
  validateResetPassword,
  validateRegistration,
  validateLogin,
};
