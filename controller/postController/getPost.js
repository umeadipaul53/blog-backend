const AppError = require("../../utils/AppError");
const blogPostModel = require("../../model/blogPostModel");
const paginate = require("../../utils/paginate");
const mongoose = require("mongoose");

const getAllPosts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = {}; // will Add filters later (e.g., by author)

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

module.exports = { getAllPosts, getSinglePost };
