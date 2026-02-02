const express = require("express");
const blogPost = express.Router();
const validate = require("../middleware/validate");
const authenticateToken = require("../middleware/authToken");
const authorizeRoles = require("../middleware/authRole");
const { upload, validateFiles } = require("../config/multer");
const createPost = require("../controller/postController/createPost");
const {
  validatePost,
  validateEditPost,
} = require("../validators/postValidator");
const deletePost = require("../controller/postController/deletePost");
const editPost = require("../controller/postController/editPost");
const {
  getAllPosts,
  getSinglePost,
} = require("../controller/postController/getPost");

blogPost
  .route("/create-post")
  .post(
    authenticateToken,
    authorizeRoles("user", "admin"),
    upload.single("image"),
    validateFiles,
    validate(validatePost),
    createPost,
  );
blogPost
  .route("/delete-post/:id")
  .delete(authenticateToken, authorizeRoles("user", "admin"), deletePost);
blogPost
  .route("/edit-post/:id")
  .put(
    authenticateToken,
    authorizeRoles("user", "admin"),
    upload.single("image"),
    validateFiles,
    validate(validateEditPost),
    editPost,
  );
blogPost.route("/get-post/:id").get(getSinglePost);
blogPost.route("/get-posts").get(getAllPosts);

module.exports = blogPost;
