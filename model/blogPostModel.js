const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true, // Cloudinary public_id
    },

    mimeType: {
      type: String,
      enum: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
      required: true,
    },

    size: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v <= 1 * 1024 * 1024; // 2MB max
        },
        message: "File size must not exceed 1MB",
      },
    },
  },
  { _id: false },
);

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    content: { type: String, required: true },
    imageUrl: { type: imageSchema },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: {
      type: String,
      required: true,
      enum: ["NodeJs", "React", "Python", "VueJs", "NextJs"],
      default: "NodeJs",
    },
  },
  { timestamps: true },
);

// Sorting by newest posts
blogPostSchema.index({ createdAt: -1 });

const blogPostModel = mongoose.model("posts", blogPostSchema);

module.exports = blogPostModel;
