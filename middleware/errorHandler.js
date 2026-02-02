const AppError = require("../utils/AppError");

//Global Error Handling Middleware
function globalErrorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
      //only include details if present
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  //for unexpected errors (programming/unknown)
  console.error("Unexpected error", err);

  return res
    .status(500)
    .json({ status: "error", message: "Internal Server Error" });
}

module.exports = globalErrorHandler;
