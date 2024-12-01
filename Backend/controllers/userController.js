const User = require('../models/User');
const JWTUtil = require('../utils/jwt');

class UserController {
    static async signup(req, res) {
        try {
            // Extract user data from request body
            const { name, email, phone, password } = req.body;

            // Create new user
            const newUser = await User.create({
                name,
                email,
                phone,
                password
            });

            // Generate JWT token for automatic login after signup
            const token = JWTUtil.generateToken({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            });

            // Set token in cookie
            JWTUtil.setTokenCookie(res, token);

            // Send success response
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    token,
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        phone: newUser.phone
                    }
                }
            });

        } catch (error) {
            console.error('Signup error:', error);

            // Handle different types of errors
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = UserController;