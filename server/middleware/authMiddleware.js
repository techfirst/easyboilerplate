const jwt = require("jsonwebtoken");
const userController = require("../controllers/userController");

async function authMiddleware(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) {
    try {
      const refreshTokenResponse = await userController.refreshToken(req, res);
      if (refreshTokenResponse && refreshTokenResponse.success) {
        req.user = { userId: refreshTokenResponse.userId };
        next();
      } else {
        // No need to send a response here, as refreshToken method already sent one
        console.log("No refresh token or refresh token invalid");
      }
    } catch (error) {
      console.error(error);
      // Error handling response if necessary
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error." });
    }
  } else {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decodedToken;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized " + error });
    }
  }
}

module.exports = authMiddleware;
