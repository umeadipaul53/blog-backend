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

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = { author: userId };

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

const getPostsByCategory = async (req, res, next) => {
  try {
    const category = req.query.category?.trim();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = {
      category: { $regex: new RegExp(`^${category}$`, "i") },
    };

    const populate = {
      path: "author",
      select: "username",
    };

    const { results: posts, pagination } = await paginate({
      model: blogPostModel,
      filter,
      page,
      limit,
      sort: "-createdAt",
      populate,
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

const getPartnerPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid Post ID format", 400));
    }

    // Fetch main post
    const mainPost = await blogPostModel.findById(id).select("category").lean();

    if (!mainPost) {
      return next(new AppError("Post not found", 404));
    }

    // Fetch partner posts by SAME CATEGORY
    let partnerPosts = await blogPostModel
      .find({
        _id: { $ne: id },
        category: mainPost.category, // ✅ EXACT MATCH (ENUM SAFE)
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("title subtitle imageUrl createdAt category")
      .lean();

    // Fallback: recent posts
    if (partnerPosts.length === 0) {
      partnerPosts = await blogPostModel
        .find({ _id: { $ne: id } })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("title subtitle imageUrl createdAt category")
        .lean();
    }

    res.status(200).json({
      status: "success",
      count: partnerPosts.length,
      data: partnerPosts,
    });
  } catch (error) {
    console.error("Error in getPartnerPost:", error);
    next(error);
  }
};

module.exports = {
  getAllPosts,
  getSinglePost,
  getMyPosts,
  getPostsByCategory,
  getPartnerPost,
};
