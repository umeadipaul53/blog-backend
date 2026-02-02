const AppError = require("../../utils/AppError");
const blogPostModel = require("../../model/blogPostModel");
const cloudinary = require("../../config/cloudinary");
const mongoose = require("mongoose");

// Upload to Cloudinary using buffer (image-only)
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "post_images",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
};

const editPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const { title, content, subtitle } = req.body;

    // Validate Post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return next(new AppError("Invalid post ID", 400));
    }

    // Find post
    const post = await blogPostModel.findById(postId);

    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    // Only post author or admin can edit
    if (!post.author.equals(userId) && req.user.role !== "admin") {
      return next(new AppError("Not authorized to edit this post", 403));
    }

    // Update text fields (partial update)
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (subtitle !== undefined) post.subtitle = subtitle;

    // Replace image if a new one is uploaded
    if (req.file) {
      // Delete old image
      if (post.imageUrl?.publicId) {
        try {
          await cloudinary.uploader.destroy(post.imageUrl.publicId, {
            resource_type: "image",
          });
        } catch (err) {
          console.warn("Old image deletion failed:", err.message);
        }
      }

      // Upload new image
      const uploadResult = await streamUpload(req.file.buffer);

      post.imageUrl = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    const updatedPost = await post.save();

    res.status(200).json({
      status: "success",
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = editPost;
