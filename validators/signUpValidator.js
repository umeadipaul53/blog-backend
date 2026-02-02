const Joi = require("joi");
const passwordRule = require("./passwordRule");
const emailRule = require("./emailRule");

const validateUserReg = Joi.object({
  email: emailRule,
  password: passwordRule.required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
});

module.exports = validateUserReg;
