const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// All user routes - admin only
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);
router.put('/:id/role', authenticate, authorize(['admin']), userController.updateUserRole);
router.put('/:id/status', authenticate, authorize(['admin']), userController.updateUserStatus);
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);
router.post('/', authenticate, authorize(['admin']), userController.createUser);

module.exports = router;