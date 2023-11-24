const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { validationResult } = require("express-validator");

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database and get the user's ID
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashedPassword]
    );

    // Use the new user's ID as the verification token
    const verificationToken = newUser.rows[0].id;

    // Send a verification email to the user
    sendVerificationEmail(res, name, email, verificationToken);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Registration error: ", error);
    res.status(500).send("Failed to register user.");
  }
};

const loginUser = async (req, res) => {
  try {
    // Destructure and get user input
    const { email, password } = req.body;

    // Check if user exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Check if user's email is verified (if you have email verification logic)
    if (!user.is_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    // Generate JWT (access token)
    const accessToken = jwt.sign(
      { user_id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { user_id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Store refresh token in the database (optional but recommended for better control)
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
      [user.id, refreshToken]
    );

    // Set cookies for access token and refresh token
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // use secure in production
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // use secure in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        message: "Logged in successfully",
        user: {
          id: user.id,
          email: user.email,
        },
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const sendVerificationEmail = async (res, name, email, token) => {
  const client = new ServerClient(process.env.POSTMARK_API_KEY);
  try {
    await client
      .sendEmail({
        From: "EasyImg.ai <stellan@techfirst.se>",
        To: email,
        Subject: "Verify your e-mail",
        TextBody: `Hello ${name},
      
  Welcome to EasyImg.ai! We are glad that you want to become a user with us. To complete your registration and activate your account, please click the link below:
  
  ${process.env.BASE_URL}/user/verify?token=${token}
  
  If you cannot click on the link, copy and paste it into your web browser.
  
  If you did not request this e-mail, you can ignore it. It is possible that someone else has accidentally entered your email address.
  
  Best regards,
  EasyImg.ai`,
      })
      .then((response) => {
        res.json({ message: "Email sent successfully.", response });
      })
      .catch((error) => {
        console.error("Error sending email via Postmark: ", error);
        res.status(500).json(error);
      });
  } catch (error) {
    console.error("Additional error: ", error);
    res.status(500).send("Failed to send email.");
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Verification token is required.");
  }

  try {
    const result = await pool.query(
      "UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING *",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Invalid verification token.");
    }

    res.status(200).send("User verified successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
  }
};

const refreshToken = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const tokenData = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [oldRefreshToken]
    );

    const refreshTokenRecord = tokenData.rows[0];
    if (
      !refreshTokenRecord ||
      new Date() > new Date(refreshTokenRecord.expires_at)
    ) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Get the user ID associated with the refresh token
    const userId = refreshTokenRecord.user_id;

    // Create a new access token
    const newAccessToken = jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    // Generate a new refresh token
    const newRefreshToken = jwt.sign(
      { userId: userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Update or delete old refresh token in the database
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      oldRefreshToken,
    ]);
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [userId, newRefreshToken]
    );

    // Set cookies for access token and refresh token
    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 900000, // 15 minutes
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

    // Send response
    return res.json({ success: true, userId: userId });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  verifyUser,
};
