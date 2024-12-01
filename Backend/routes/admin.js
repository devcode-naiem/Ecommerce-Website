const express = require("express");
const AdminController = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const AdminOrderController = require("../controllers/adminOrderController");
const { getOrdersValidationRules } = require("../validators/adminValidator");

const router = express.Router();

// Public admin routes
router.post("/login", AdminController.login);
router.post("/logout", AdminController.logout);

// Protected admin routes (requires valid admin token)
router.get(
  "/verify",
  authMiddleware,
  adminMiddleware,
  AdminController.verifyAdmin
);

// Admin orders route
router.get(
  "/checkout/getall",
  authMiddleware,
  adminMiddleware,
  getOrdersValidationRules,
  AdminOrderController.getAllOrders
);

module.exports = router;
