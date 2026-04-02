const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Strict security: Only Admins and Analysts can access the Analytics module
router.use(authenticate, authorize(['admin', 'analyst']));

// View Route
router.get('/', analyticsController.showAnalytics);

// API Endpoints
router.get('/summary', analyticsController.getSummary);
router.get('/category', analyticsController.getCategoryTotals);
router.get('/trends', analyticsController.getTrends);
router.get('/advanced-stats', analyticsController.getAdvancedStats);
router.get('/export', analyticsController.exportCSV);

module.exports = router;
