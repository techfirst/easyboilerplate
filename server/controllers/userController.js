const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { validationResult } = require("express-validator");
const { ServerClient } = require("postmark");
const crypto = require("crypto");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    if (!res.headersSent) {
      res.status(500).send("Failed to register user.");
    }
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Fetch user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res
        .status(401)
        .json({ success: false, message: "Please verify your email first" });
    }

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" } // short-lived access token
    );

    // Generate Refresh Token (you may want to use a different secret or a random string for signing refresh tokens)
    const refreshToken = jwt.sign(
      { user_id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" } // long-lived refresh token
    );

    // Store refresh token in the database (optional but recommended for better control)
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [user.id, refreshToken]
    );

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure secure is true in production
        maxAge: 900000, // 15 minutes in milliseconds
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure secure is true in production
        maxAge: 604800000, // 7 days in milliseconds
      })
      .json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error.");
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
  } catch (error) {
    console.error("Error sending email via Postmark: ", error);
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
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.log("No refresh token provided");
    return res
      .status(400)
      .json({ success: false, message: "Refresh token required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [refreshToken]
    );

    const tokenData = result.rows[0];

    if (!tokenData) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    // Get the user ID associated with the refresh token
    const userId = tokenData.user_id;
    const user = await getUserById(userId);

    // Create a new access token
    const newAccessToken = jwt.sign(
      { user_id: userId, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 900000,
    });

    res.json({ success: true, user: user });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};

const refreshTokenFromMiddleware = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ success: false, message: "Refresh token required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [refreshToken]
    );

    const tokenData = result.rows[0];

    if (!tokenData) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    // Get the user ID associated with the refresh token
    const userId = tokenData.user_id;
    const user = await getUserById(userId);

    // Create a new access token
    const newAccessToken = jwt.sign(
      { user_id: userId, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 900000,
    });

    return { success: true, userId: userId, email: user.email };
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
        SELECT users.id, 
        users.firstname, 
        users.lastname, 
        users.email, 
        users.company_name, 
        users.is_verified, 
        users.subscription_id, 
        users.credits, 
        users.subscription_start_date,
        users.subscription_end_date,
        subscriptions.name AS subscription_name,
        subscriptions.price AS subscription_price
        FROM users
        LEFT JOIN subscriptions ON users.subscription_id = subscriptions.id
        WHERE users.id = $1
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

const getUserById = async (userId) => {
  try {
    const result = await pool.query(
      `
        SELECT users.id, 
        users.firstname, 
        users.lastname, 
        users.email, 
        users.company_name, 
        users.is_verified, 
        users.subscription_id, 
        users.credits, 
        subscriptions.name AS subscription_name,
        subscriptions.price AS subscription_price
        FROM users
        LEFT JOIN subscriptions ON users.subscription_id = subscriptions.id
        WHERE users.id = $1
      `,
      [userId]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching user data:", error);
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

const logoutUser = async (req, res) => {
  const userId = req.user.user_id;
  try {
    // Assuming you store the token in the request (e.g., in a cookie)
    const token = req.cookies.accessToken;

    // Invalidate the token. This could be deleting it from the database
    // or marking it as inactive, depending on your implementation.
    await invalidateToken(token);

    // Clear the token from the response (e.g., clearing cookies)
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send("Internal Server Error");
  }
};

async function invalidateToken(token) {
  // Assuming the refresh token is stored in the 'refresh_tokens' table in your database
  // and it's associated with the user's ID.
  try {
    // Delete the refresh token from the database
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
  } catch (error) {
    console.error("Error invalidating token:", error);
    throw new Error("Failed to invalidate token.");
  }
}

const updateUserProfile = async (req, res) => {
  // Extract user ID from the request object
  const userId = req.user.user_id;

  // Extract user details from the request body
  const { firstname, lastname, companyName } = req.body;

  try {
    // Validate the input (you can add more validation as needed)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Update the user's information in the database
    await pool.query(
      "UPDATE users SET firstname = $1, lastname = $2, company_name = $3 WHERE id = $4",
      [firstname, lastname, companyName, userId]
    );

    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Error updating user profile" });
  }
};

const checkSubscription = async (req, res) => {
  var email = req.user.email;

  try {
    const customers = await stripe.customers.list({
      email: email,
    });

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
      });

      res
        .status(200)
        .json({ hasActiveSubscription: subscriptions.data.length > 0 });
      return;
    }

    res.status(200).json({ hasActiveSubscription: false });
  } catch (error) {
    console.error("Error checking if user have active subscription:", error);
    res
      .status(500)
      .json({ message: "Error checking if user have active subscription" });
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
  logoutUser,
  updateUserProfile,
  checkSubscription,
  refreshTokenFromMiddleware,
};
