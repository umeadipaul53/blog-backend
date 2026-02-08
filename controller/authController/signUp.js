const userModel = require("../../model/userModel");
const AppError = require("../../utils/AppError");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../utils/emailServices");
const generateAccessToken = require("../../middleware/generateToken");
const isProduction = process.env.NODE_ENV === "production";

const signUp = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError("Request body is missing", 400));
    }

    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return next(new AppError("Missing required fields", 400));
    }

    const year = new Date().getFullYear();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(newUser);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      partitioned: isProduction ? true : false, // REQUIRED
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    const name = newUser.username;
    // Sending email in background
    sendEmail({
      to: newUser.email,
      subject: "Welcome to Chisco Blog",
      templateName: "welcome",
      variables: { name, year },
    }).catch((err) => {
      console.error("Welcome email failed:", err.message);
    });

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    // Handle duplicate key error
    if (err.code === 11000) {
      return next(
        new AppError(`${Object.keys(err.keyValue)[0]} already exists`, 409),
      );
    }
    next(err);
  }
};

module.exports = signUp;
