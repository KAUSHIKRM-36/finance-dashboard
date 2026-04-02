const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// GET routes - Show forms
router.get('/login', authController.showLogin);
router.get('/register', authController.showRegister);

// POST routes - Handle submissions
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

module.exports = router;