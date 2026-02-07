const express = require("express");
const userRoute = express.Router();
const authenticateToken = require("../middleware/authToken");
const authorizeRoles = require("../middleware/authRole");
const user = require("../controller/userController/user");

userRoute
  .route("/me")
  .get(authenticateToken, authorizeRoles("user", "admin"), user);

module.exports = userRoute;
