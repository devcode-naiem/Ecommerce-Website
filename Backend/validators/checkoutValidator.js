const { body, validationResult } = require('express-validator');

const checkoutValidationRules = [
    // User Details Validation
    body('userCheckoutDetails.fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('userCheckoutDetails.address')
        .trim()
        .notEmpty().withMessage('Address is required')
        .isLength({ max: 500 }).withMessage('Address too long'),

    body('userCheckoutDetails.city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ max: 50 }).withMessage('City name too long'),

    body('userCheckoutDetails.state')
        .trim()
        .notEmpty().withMessage('State is required')
        .isLength({ max: 50 }).withMessage('State name too long'),

    body('userCheckoutDetails.zipCode')
        .trim()
        .notEmpty().withMessage('ZIP code is required')
        .isLength({ max: 10 }).withMessage('Invalid ZIP code'),

    body('userCheckoutDetails.bkashNumber')
        .trim()
        .notEmpty().withMessage('bKash number is required')
        .matches(/^\+8801[3-9]\d{8}$/).withMessage('Invalid bKash number format'),

    body('userCheckoutDetails.transactionId')
        .trim()
        .notEmpty().withMessage('Transaction ID is required')
        .isLength({ min: 5, max: 50 }).withMessage('Invalid transaction ID'),

    // Product Details Validation
    body('userCheckoutProductDetails.products')
        .isArray({ min: 1 }).withMessage('At least one product is required'),

    body('userCheckoutProductDetails.products.*.productId')
        .isInt({ min: 1 }).withMessage('Invalid product ID'),

    body('userCheckoutProductDetails.products.*.productQuantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

    body('userCheckoutProductDetails.products.*.price')
        .isFloat({ min: 0 }).withMessage('Invalid price'),

    body('userCheckoutProductDetails.products.*.productTotalPrice')
        .isFloat({ min: 0 }).withMessage('Invalid total price'),

    body('userCheckoutProductDetails.grossTotalPrice')
        .isFloat({ min: 0 }).withMessage('Invalid gross total'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = checkoutValidationRules;