const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const userModel = require("../model/userModel");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = bearerToken || req.cookies?.accessToken;

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError("Token expired", 401, { expiredAt: err.expiredAt }),
      );
    }

    return next(new AppError("Token invalid", 403));
  }
};

module.exports = authenticateToken;
