const express = require('express');
const CheckoutController = require('../controllers/checkoutController');
const checkoutValidationRules = require('../validators/checkoutValidator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    checkoutValidationRules,
    CheckoutController.processCheckout
);

module.exports = router;