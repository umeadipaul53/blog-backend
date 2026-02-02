const express = require("express");
const auth = express.Router();
const validate = require("../middleware/validate");
const loginUser = require("../controller/authController/loginUser");
const validateUserLogin = require("../validators/loginValidator");
const signUp = require("../controller/authController/signUp");
const validateUserReg = require("../validators/signUpValidator");
const logout = require("../controller/authController/logout");

auth.route("/login").post(validate(validateUserLogin), loginUser);
auth.route("/signup").post(validate(validateUserReg), signUp);
auth.route("/logout").post(logout);

module.exports = auth;
