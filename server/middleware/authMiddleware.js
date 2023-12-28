const jwt = require("jsonwebtoken");
const userController = require("../controllers/userController");

async function authMiddleware(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    try {
      const refreshTokenResponse =
        await userController.refreshTokenFromMiddleware(req, res);

      if (refreshTokenResponse && refreshTokenResponse.success) {
        req.user = {
          user_id: refreshTokenResponse.userId,
          email: refreshTokenResponse.email,
        };
        next();
      } else {
        // console.log(
        //   "Auth Middleware: No refresh token or refresh token invalid"
        // );
      }
    } catch (error) {
      // console.error("Auth Middleware Error:", error);
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
