const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/AppError");

// First-level check: filter obvious non-images
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/x-png",
    "image/webp",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only JPEG, PNG and WebP files are allowed!", 400), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024,
    files: 10,
  },
});

// Deep validation: check buffer contents
const validateFiles = async (req, res, next) => {
  try {
    let files = [];

    if (req.file) files = [req.file];
    else if (Array.isArray(req.files)) files = req.files;
    else if (typeof req.files === "object" && req.files !== null) {
      Object.values(req.files).forEach((arr) => {
        files.push(...arr);
      });
    }

    // Files are OPTIONAL
    if (!files.length) return next();

    // ✅ Dynamic ESM import (FIX)
    const { fileTypeFromBuffer } = await import("file-type");

    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    for (const file of files) {
      const type = await fileTypeFromBuffer(file.buffer);

      if (!type || !allowedMimeTypes.includes(type.mime)) {
        return next(new AppError(`Unsupported file type: ${type?.mime}`, 400));
      }

      // Validate images with sharp
      if (type.mime.startsWith("image")) {
        await sharp(file.buffer)
          .metadata()
          .catch(() => {
            throw new AppError("Corrupted image file", 400);
          });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, validateFiles };
