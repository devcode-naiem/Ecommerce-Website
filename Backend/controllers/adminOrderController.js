const Order = require('../models/Order');

class AdminOrderController {
    static async getAllOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;

            // Get orders with stats
            const result = await Order.getOrdersWithStats(page, limit);

            // Format orders data
            const formattedOrders = result.orders.map(order => ({
                orderId:order.id,
                transactionId: order.transaction_id,
                userName: order.full_name,
                userEmail: order.user_email,
                date: order.created_at,
                amount: parseFloat(order.total_amount),
                status: order.status
            }));

            // Generate pagination URLs
            const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/getall`;
            const createPageUrl = (pageNum) => `${baseUrl}?page=${pageNum}&limit=${limit}`;

            res.json({
                success: true,
                message: 'Orders retrieved successfully',
                data: {
                    orders: formattedOrders,
                    statistics: {
                        totalCheckouts: result.stats.total_checkouts,
                        pendingCheckouts: result.stats.pending_count,
                        processingCheckouts: result.stats.processing_count,
                        onTransitCheckouts: result.stats.ontransit_count,
                        deliveredCheckouts: result.stats.delivered_count,
                        canceledCheckouts: result.stats.canceled_count
                    },
                    pagination: {
                        totalPages: result.pagination.totalPages,
                        currentPage: result.pagination.currentPage,
                        nextPage: result.pagination.nextPage,
                        prevPage: result.pagination.prevPage,
                        currentPageUrl: createPageUrl(result.pagination.currentPage),
                        nextPageUrl: result.pagination.hasNextPage ? createPageUrl(result.pagination.nextPage) : null,
                        prevPageUrl: result.pagination.hasPrevPage ? createPageUrl(result.pagination.prevPage) : null
                    }
                }
            });

        } catch (error) {
            console.error('Error in getAllOrders:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch orders',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async getOrderDetails(req, res) {
        try {
            const orderId = parseInt(req.params.id);
            
            // Get detailed order information
            const result = await Order.getOrderDetails(orderId);
            
            // Format the data for response
            const formattedResponse = {
                orderDetails: {
                    orderId: result.orderInfo.id,
                    transactionId: result.orderInfo.transaction_id,
                    orderDate: result.orderInfo.created_at,
                    status: result.orderInfo.status,
                    customerInfo: {
                        name: result.orderInfo.full_name,
                        email: result.orderInfo.user_email,
                        phone: result.orderInfo.user_phone,
                        shippingAddress: {
                            address: result.orderInfo.address,
                            city: result.orderInfo.city,
                            state: result.orderInfo.state,
                            zipCode: result.orderInfo.zip_code
                        }
                    },
                    paymentInfo: {
                        bkashNumber: result.orderInfo.bkash_number,
                        transactionId: result.orderInfo.transaction_id,
                        totalAmount: parseFloat(result.orderInfo.total_amount)
                    }
                },
                products: result.orderItems.map(item => ({
                    productId: item.product_id,
                    name: item.product_name,
                    authors: item.authors,
                    imageUrl: item.image_url,
                    quantity: item.quantity,
                    pricePerUnit: parseFloat(item.price_at_time),
                    totalPrice: parseFloat(item.total_price)
                })),
                summary: {
                    totalItems: result.orderItems.reduce((sum, item) => sum + item.quantity, 0),
                    subTotal: result.orderItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0),
                    grossTotal: parseFloat(result.orderInfo.total_amount)
                }
            };

            res.json({
                success: true,
                message: 'Order details retrieved successfully',
                data: formattedResponse
            });

        } catch (error) {
            console.error('Error in getOrderDetails:', error);

            if (error.message === 'Order not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to fetch order details',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = AdminOrderController;