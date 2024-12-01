const Order = require('../models/Order');

class CheckoutController {
    static async processCheckout(req, res) {
        try {
            const { userCheckoutDetails, userCheckoutProductDetails } = req.body;
            const userId = req.user.id; // From auth middleware

            // Validate products and prices
            const calculatedGrossTotal = await Order.validateProducts(
                userCheckoutProductDetails.products
            );

            // Verify gross total
            if (Math.abs(calculatedGrossTotal - userCheckoutProductDetails.grossTotalPrice) > 0.01) {
                return res.status(400).json({
                    success: false,
                    message: 'Gross total price mismatch'
                });
            }

            // Create order
            const orderId = await Order.createOrder(
                userId,
                userCheckoutDetails,
                userCheckoutProductDetails.products,
                calculatedGrossTotal
            );

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                data: {
                    orderId,
                    totalAmount: calculatedGrossTotal,
                    status: 'pending'
                }
            });

        } catch (error) {
            console.error('Checkout error:', error);

            // Handle specific errors
            if (error.message.includes('Product with ID') || 
                error.message.includes('price mismatch')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Checkout failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = CheckoutController;