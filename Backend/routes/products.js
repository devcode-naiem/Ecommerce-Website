const express = require("express");
const ProductController = require("../controllers/productController");
const { productValidationRules, getProductsValidationRules } = require("../validators/productValidator");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// Spread the validation rules array
router.post(
    "/add-products",
    authMiddleware,
    adminMiddleware,
    ...productValidationRules,  // Use spread operator here
    ProductController.addProducts
);

router.get(
    "/",
    ...getProductsValidationRules,  // Use spread operator here
    ProductController.getProducts
);

module.exports = router;