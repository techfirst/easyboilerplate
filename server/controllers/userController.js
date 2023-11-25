const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { validationResult } = require("express-validator");
const { ServerClient } = require("postmark");
const crypto = require("crypto");

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, company_name, email, password1 } = req.body;

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
    const hashedPassword = await bcrypt.hash(password1, 10);

    // Insert the new user into the database and get the user's ID
    const newUser = await pool.query(
      "INSERT INTO users (firstname, lastname, company_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [firstname, lastname, company_name, email, hashedPassword]
    );

    // Use the new user's ID as the verification token
    const verificationToken = newUser.rows[0].id;

    try {
      // Send a verification email to the user
      await sendVerificationEmail(res, firstname, email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email: ", emailError);
      // Consider whether to delete the user or mark as unverified in case of email failure
    }

    res.status(201).json({
      message: "User registered successfully. Please verify your e-mail.",
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
        .json({ message: "Please verify your e-mail first" });
    }

    // Generate JWT (access token)
    const accessToken = jwt.sign(
      { user_id: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { user_id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Store refresh token in the database (optional but recommended for better control)
    const expiresIn = 7; // days until expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt]
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
        success: true,
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
    const response = await client.sendEmail({
      From: process.env.SYSTEM_NAME + " <" + process.env.FROM_EMAIL + ">",
      To: email,
      Subject: "Verify your e-mail",
      TextBody: `Hello ${name},
        
  Welcome to ${process.env.SYSTEM_NAME} - We are glad that you want to join us. To complete your registration and activate your account, please click the link below:
  
  ${process.env.BASE_URL}/verify-user/${token}
  
  If you cannot click on the link, copy and paste it into your web browser.
  
  If you did not request this e-mail, you can ignore it. It is possible that someone else has accidentally entered your email address.
  
  Best regards,
  ${process.env.SYSTEM_NAME}`,
    });

    // Send success response
    res.json({ message: "Email sent successfully.", response });
  } catch (error) {
    console.error("Error sending email via Postmark: ", error);
    // Check if headers have already been sent
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send email." });
    }
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

const getUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await pool.query(
      `
        SELECT firstname, lastname, email, company_name, is_verified
        FROM users
        WHERE id = $1
      `,
      [userId]
    );
    const user = result.rows[0];
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal Server Error.");
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // Find user by email
  const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = userResult.rows[0];

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  // Store token in the database with an expiration time
  // Convert JavaScript timestamp to PostgreSQL timestamp
  const expiresAt = new Date(Date.now() + 3600000).toISOString();

  await pool.query(
    "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
    [resetToken, expiresAt, user.id]
  );

  // Send email with reset link (implement sendPasswordResetEmail function)
  sendPasswordResetEmail(user.email, resetToken);

  res.json({ message: "Password reset email sent." });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const client = new ServerClient(process.env.POSTMARK_API_KEY);
  try {
    const response = await client.sendEmail({
      From: process.env.SYSTEM_NAME + " <" + process.env.FROM_EMAIL + ">",
      To: email,
      Subject: process.env.SYSTEM_NAME + " - Password reset request",
      TextBody: `You have requested to reset your password. Please use the following link to set a new password: ${process.env.BASE_URL}/reset-password/${resetToken}

If you did not request a password reset, please ignore this email.

Best regards,
${process.env.SYSTEM_NAME}`,
    });

    console.log("Password reset email sent successfully.", response);
  } catch (error) {
    console.error("Error sending password reset email via Postmark: ", error);
    throw new Error("Failed to send password reset email.");
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Find user by reset token and check if token is expired
    const userResult = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()",
      [token]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and clear reset token fields
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: "Password successfully reset" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  verifyUser,
  getUser,
  forgotPassword,
  resetPassword,
};
