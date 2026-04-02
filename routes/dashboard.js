const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, dashboardController.getDashboard);

module.exports = router;