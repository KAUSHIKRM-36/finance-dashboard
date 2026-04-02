const Record = require('../models/Record');

// Get all records (company-wide)
exports.getRecords = async (req, res) => {
  try {
    const filters = {
      category: req.query.category || null,
      type: req.query.type || null,
      dateFrom: req.query.dateFrom || null,
      dateTo: req.query.dateTo || null
    };

    // Remove null filters
    Object.keys(filters).forEach(key => filters[key] === null && delete filters[key]);

    const records = await Record.getAll(filters);
    const user = req.session.user;

    res.render('records', {
      records,
      user,
      filters: req.query
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
};

// Create new record
exports.createRecord = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    const userId = req.session.user.id;

    // Validation
    if (!amount || !type || !category || !date) {
      return res.status(400).json({
        error: 'Amount, type, category, and date are required'
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        error: 'Type must be either income or expense'
      });
    }

    const validCategories = {
      expense: ['Operations', 'Travel / Marketing', 'Payroll / Staff'],
      income: ['Sales / Revenue', 'Investments / Returns', 'Other Income']
    };

    if (!validCategories[type]?.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category for the selected type'
      });
    }

    // Create record
    const recordId = await Record.create({
      userId,
      amount,
      type,
      category,
      description,
      date
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      recordId
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
};

// Update record
exports.updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, description, date } = req.body;
    const user = req.session.user;

    // Get record to check ownership
    const record = await Record.getById(id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Check authorization
    if (user.role === 'analyst' && record.user_id !== user.id) {
      return res.status(403).json({
        error: 'You can only edit your own records'
      });
    }

    // Validation
    if (!amount || !type || !category || !date) {
      return res.status(400).json({
        error: 'Amount, type, category, and date are required'
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        error: 'Type must be either income or expense'
      });
    }

    const validCategories = {
      expense: ['Operations', 'Travel / Marketing', 'Payroll / Staff'],
      income: ['Sales / Revenue', 'Investments / Returns', 'Other Income']
    };

    if (!validCategories[type]?.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category for the selected type'
      });
    }

    // Update record
    await Record.update(id, {
      amount,
      type,
      category,
      description,
      date
    });

    res.json({
      success: true,
      message: 'Record updated successfully'
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
};

// Delete record
exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Record.getById(id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete record
    await Record.delete(id);

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
};