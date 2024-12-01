const User = require('../models/User');
const JWTUtil = require('../utils/jwt');

class AuthController {
    static async signin(req, res) {
        try {
            const { email, password } = req.body;

            // Verify credentials and get user data
            const user = await User.verifyCredentials(email, password);

            // Generate JWT token with user information
            const token = JWTUtil.generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            });

            // Set token in cookies with enhanced security options
            res.cookie('token', token, {
                httpOnly: false, // Prevents JavaScript access
                secure: process.env.NODE_ENV !== 'production', // HTTPS only in production
                sameSite: 'none', // CSRF protection
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                path: '/' // Cookie available for all paths
            });

            // Send success response with user data
            res.json({
                success: true,
                message: 'Signin successful',
                data: {
                    token, // Token for localStorage if needed
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role
                    }
                }
            });

        } catch (error) {
            console.error('Signin error:', error);

            // Handle different types of errors
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Signin failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = AuthController;