const userModel = require("../../model/userModel");
const AppError = require("../../utils/AppError");
const blogPostModel = require("../../model/blogPostModel");
const cloudinary = require("../../config/cloudinary");

// upload to cloudinary using buffer
const streamUpload = (buffer, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "post_files",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
};

const createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, subtitle, content } = req.body;

    // validate input
    if (!title || !content || !subtitle) {
      return next(
        new AppError("Title, subtitle and content are required", 400),
      );
    }

    // verify user
    const user = await userModel.findById(userId);
    if (!user) return next(new AppError("User not found", 404));

    // check image
    if (!req.file) {
      return next(new AppError("Post image is required", 400));
    }

    // allow only images
    if (!req.file.mimetype.startsWith("image/")) {
      return next(
        new AppError("Only image files are allowed (jpg, png, webp)", 400),
      );
    }

    const uploadResult = await streamUpload(req.file.buffer, "image");

    const imageUrl = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };

    const post = await blogPostModel.create({
      title,
      subtitle,
      content,
      imageUrl,
      author: userId,
    });

    res.status(201).json({
      status: "success",
      message: "Post created successfully",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = createPost;
