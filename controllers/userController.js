const User = require('../models/User');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    const currentUser = req.session.user;

    res.render('users', {
      users,
      user: currentUser
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.session.user.id;

    // Prevent modifying the super-admin (ID 1)
    if (parseInt(id) === 1 && adminId !== 1) {
      return res.status(403).json({ error: 'The primary administrator account cannot be modified by other admins' });
    }

    // Validation
    if (role === 'admin') {
      return res.status(403).json({ error: 'Administrative roles can only be assigned via direct database access for security' });
    }
    if (!['viewer', 'analyst'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role selection. Please choose Viewer or Analyst' });
    }

    // Prevent admin from changing their own role
    if (parseInt(id) === adminId) {
      return res.status(403).json({ error: 'Self-role modification is prohibited to prevent lockout' });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role
    await User.updateRole(id, role);

    res.json({
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Update user status (admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.session.user.id;

    // Validation
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be active or inactive.'
      });
    }

    // Prevent admin from deactivating themselves
    if (parseInt(id) === adminId && status === 'inactive') {
      return res.status(403).json({
        error: 'You cannot deactivate your own account'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update status
    await User.updateStatus(id, status);

    res.json({
      success: true,
      message: `User status updated to ${status}`
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.session.user.id;

    // Prevent admin from deleting themselves
    if (parseInt(id) === adminId) {
      return res.status(403).json({
        error: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await User.delete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Create user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['viewer', 'analyst'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be viewer or analyst. Admins cannot be created via API.' });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create user
    const userId = await User.create({ username, email, password, role });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user. Please try again.' });
  }
};