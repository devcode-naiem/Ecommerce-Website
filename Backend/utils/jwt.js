const jwt = require("jsonwebtoken");

class JWTUtil {
  // Generate JWT token with provided payload and optional expiry
  static generateToken(payload, expiresIn = "24h") {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  // Verify JWT token and return decoded data
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  // Set JWT token in cookies with configurable options
  static setTokenCookie(res, token, options = {}) {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
      sameSite: "none", // Allow cross-site usage
    };

    res.cookie("token", token, { ...defaultOptions, ...options });
  }
}

module.exports = JWTUtil;
