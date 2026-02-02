const AppError = require("../../utils/AppError");
const blogPostModel = require("../../model/blogPostModel");
const paginate = require("../../utils/paginate");
const mongoose = require("mongoose");

const getAllPosts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = {};

    const { results: posts, pagination } = await paginate({
      model: blogPostModel,
      filter,
      page,
      limit,
      sort: "-createdAt",
      lean: true, // faster, returns plain JS objects
    });

    res.status(200).json({
      status: "success",
      message:
        posts.length > 0 ? "Posts retrieved successfully" : "No posts found",
      count: pagination.totalResults,
      pagination,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

const getSinglePost = async (req, res, next) => {
  try {
    const postId = req.params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return next(new AppError("Invalid post ID", 400));
    }

    // Fetch post, optionally populate author info
    const post = await blogPostModel
      .findById(postId)
      .populate("author", "username") // populate authir username
      .lean();

    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Post fetched successfully",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

const getMyPosts = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const userId = req.user.id;

    const filter = { author: userId };

    // Fetch posts by the logged-in user
    const posts = await blogPostModel
      .find(filter)
      .limit(10)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: "success",
      message:
        posts.length > 0 ? "Posts retrieved successfully" : "No posts found",
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

const getPostsByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = { category }; // filters by category

    const { results: posts, pagination } = await paginate({
      model: blogPostModel,
      filter,
      page,
      limit,
      sort: "-createdAt",
      lean: true, // faster, returns plain JS objects
    });

    res.status(200).json({
      status: "success",
      message:
        posts.length > 0 ? "Posts retrieved successfully" : "No posts found",
      count: pagination.totalResults,
      pagination,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPosts, getSinglePost, getMyPosts, getPostsByCategory };
