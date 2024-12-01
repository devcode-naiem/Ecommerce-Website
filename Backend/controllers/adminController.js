const JWTUtil = require('../utils/jwt');

class AdminController {
    // Admin login handler
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Verify admin credentials against environment variables
            if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid admin credentials'
                });
            }

            // Create admin payload for token
            const adminPayload = {
                name: process.env.ADMIN_NAME,
                email: process.env.ADMIN_EMAIL,
                role: 'admin',
                isAdmin: true
            };

            // Generate JWT token
            const token = JWTUtil.generateToken(adminPayload);

            // Set token in cookie
            JWTUtil.setTokenCookie(res, token);

            // Send response with admin data for local storage
            res.json({
                success: true,
                message: 'Admin login successful',
                data: {
                    token,
                    admin: {
                        name: process.env.ADMIN_NAME,
                        email: process.env.ADMIN_EMAIL,
                        role: 'admin'
                    }
                }
            });

        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'Admin login failed'
            });
        }
    }

    // Admin logout handler
    static async logout(req, res) {
        try {
            // Clear the token cookie
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            });

            res.json({
                success: true,
                message: 'Admin logout successful'
            });
        } catch (error) {
            console.error('Admin logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Admin logout failed'
            });
        }
    }

    // Verify admin token
    static async verifyAdmin(req, res) {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            // Verify token and check if it's an admin token
            const decoded = JWTUtil.verifyToken(token);
            if (!decoded.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized as admin'
                });
            }

            res.json({
                success: true,
                message: 'Valid admin token',
                data: {
                    admin: {
                        name: decoded.name,
                        email: decoded.email,
                        role: decoded.role
                    }
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid admin token'
            });
        }
    }
}

module.exports = AdminController;