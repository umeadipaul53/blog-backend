const Joi = require("joi");

const validatePost = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    "string.empty": "Post title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 150 characters",
  }),

  subtitle: Joi.string().trim().min(3).max(250).required().allow("").messages({
    "string.min": "Subtitle must be at least 3 characters",
    "string.max": "Subtitle must not exceed 250 characters",
  }),

  content: Joi.string().trim().min(20).required().messages({
    "string.empty": "Post content is required",
    "string.min": "Content must be at least 20 characters",
  }),

  category: Joi.string()
    .valid("NodeJs", "React", "Python", "C++", "C#")
    .default("NodeJs")
    .required(),
});

const validateEditPost = Joi.object({
  title: Joi.string().trim().min(3).max(150).optional().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 150 characters",
  }),

  subtitle: Joi.string().trim().min(3).max(250).optional().allow("").messages({
    "string.min": "Subtitle must be at least 3 characters",
    "string.max": "Subtitle must not exceed 250 characters",
  }),

  content: Joi.string().trim().min(20).optional().messages({
    "string.min": "Content must be at least 20 characters",
  }),
});

module.exports = { validatePost, validateEditPost };
