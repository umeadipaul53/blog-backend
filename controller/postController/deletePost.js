const AppError = require("../../utils/AppError");
const blogPostModel = require("../../model/blogPostModel");
const mongoose = require("mongoose");
const cloudinary = require("../../config/cloudinary");

const deletePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return next(new AppError("Invalid post ID", 400));
    }

    const post = await blogPostModel.findById(postId);

    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    // Only post author and admin can delete post
    if (!post.author.equals(userId) && req.user.role !== "admin") {
      return next(new AppError("Not authorized to delete this post", 403));
    }

    // Delete image from Cloudinary
    if (post.imageUrl?.publicId) {
      await cloudinary.uploader.destroy(post.imageUrl.publicId, {
        resource_type: "image",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = deletePost;
