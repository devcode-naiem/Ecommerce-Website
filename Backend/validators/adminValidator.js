const { query,param, validationResult } = require('express-validator');

const getOrdersValidationRules = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),
        
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt(),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: errors.array()
            });
        }
        next();
    }
];

const orderDetailsValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid order ID'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID',
                errors: errors.array()
            });
        }
        next();
    }
];


module.exports = {
    getOrdersValidationRules,
    orderDetailsValidation
};