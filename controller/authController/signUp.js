const userModel = require("../../model/userModel");
const AppError = require("../../utils/AppError");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../utils/emailServices");

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

    // Sending email in background
    sendEmail({
      to: newUser.email,
      subject: "Welcome to Chisco Blog",
      templateName: "welcome",
      variables: { username, year },
    }).catch((err) => {
      console.error("Welcome email failed:", err.message);
    });

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        email: newUser.email,
        username: newUser.username,
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
