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
}

module.exports = AdminOrderController;