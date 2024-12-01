const express = require('express');
const AdminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public admin routes
router.post('/login', AdminController.login);
router.post('/logout', AdminController.logout);

// Protected admin routes (requires valid admin token)
router.get('/verify', authMiddleware, adminMiddleware, AdminController.verifyAdmin);

module.exports = router;