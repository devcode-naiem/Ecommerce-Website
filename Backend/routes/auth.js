const express = require('express');
const UserController = require('../controllers/userController');
const AuthController = require('../controllers/authController');
const { signupValidationRules, signinValidationRules } = require('../validators/authValidator');

const router = express.Router();

// User registration route
router.post('/signup', signupValidationRules, UserController.signup);

// User signin route
router.post('/signin', signinValidationRules, AuthController.signin);

module.exports = router;