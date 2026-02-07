const userModel = require("../../model/userModel");
const AppError = require("../../utils/AppError");

const user = async (req, res, next) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("id email username role");

    if (!user) {
      return next(new AppError("user not found", 404));
    }

    res.json({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = user;
