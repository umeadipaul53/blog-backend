const AppError = require("../utils/AppError");
const sanitize = require("mongo-sanitize");

const validate = (schema = null, property = "body") => {
  return (req, res, next) => {
    const activeSchema = schema || req.validationSchema;

    if (!activeSchema) {
      return next(new AppError("No validation schema provided", 500));
    }

    // 🚨 PROTECT AGAINST UNDEFINED
    if (!req[property]) {
      return next(new AppError(`Request ${property} is missing`, 400));
    }

    const sanitizedInput = sanitize(req[property]);

    const { error, value } = activeSchema.validate(sanitizedInput, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const formattedErrors = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message.replace(/["]/g, ""),
      }));

      return res.status(400).json({
        message: "Validation failed",
        details: formattedErrors,
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
