const isProduction = process.env.NODE_ENV === "production";

const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
  });

  return res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

module.exports = logout;
