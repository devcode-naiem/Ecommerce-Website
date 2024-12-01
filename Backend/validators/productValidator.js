const { query, body,param, validationResult } = require("express-validator");

// Helper function to check if input is array
const isArrayInput = (input) => Array.isArray(input);

const productValidationRules = [
  // Middleware to handle both single object and array of objects
  (req, res, next) => {
    // If input is an array, wrap single object in array
    if (!Array.isArray(req.body)) {
      req.body = [req.body];
    }
    next();
  },

  // Validate each product in the array
  body("*.name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 255 })
    .withMessage("Name must be less than 255 characters"),

  body("*.authors")
    .trim()
    .notEmpty()
    .withMessage("Authors are required")
    .isLength({ max: 255 })
    .withMessage("Authors must be less than 255 characters"),

  body("*.price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number")
    .custom((value) => {
      if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
        throw new Error("Price must be a valid positive number");
      }
      return true;
    }),

  body("*.description")
    .trim()
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  body("*.image_url")
    .trim()
    .optional()
    .isURL()
    .withMessage("Invalid image URL format"),

  body("*.stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer")
    .toInt(),

  // Final validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((error) => ({
          field: error.path.replace("*.", ""),
          message: error.msg,
          index: error.location,
        })),
      });
    }
    next();
  },
];

const getProductsValidationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search query must not be empty"),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: errors.array(),
      });
    }
    next();
  },
];

const getProductByIdValidation = [
  param('id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
      
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({
              success: false,
              message: 'Invalid product ID',
              errors: errors.array()
          });
      }
      next();
  }
];

module.exports = {
  productValidationRules,
  getProductsValidationRules,
  getProductByIdValidation
};
