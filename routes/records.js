const express = require('express');
const recordController = require('../controllers/recordController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Anyone can view records
router.get('/', authenticate, recordController.getRecords);

// Only admin can create
router.post('/', authenticate, authorize(['admin']), recordController.createRecord);

// Only analyst and admin can edit (controller checks ownership for analyst)
router.put('/:id', authenticate, authorize(['analyst', 'admin']), recordController.updateRecord);

// Only admin can delete
router.delete('/:id', authenticate, authorize(['admin']), recordController.deleteRecord);

module.exports = router;