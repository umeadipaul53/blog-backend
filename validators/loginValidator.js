const Joi = require("joi");
const passwordRule = require("./passwordRule");
const emailRule = require("./emailRule");

const validateUserLogin = Joi.object({
  email: emailRule,
  password: passwordRule.required(),
});

module.exports = validateUserLogin;
