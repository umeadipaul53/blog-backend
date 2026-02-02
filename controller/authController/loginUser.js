const userModel = require("../../model/userModel");
const AppError = require("../../utils/AppError");
const bcrypt = require("bcryptjs");
const generateAccessToken = require("../../middleware/generateToken");

const isProduction = process.env.NODE_ENV === "production";

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    const accessToken = generateAccessToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = loginUser;
