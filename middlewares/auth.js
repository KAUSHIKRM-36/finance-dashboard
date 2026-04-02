const User = require('../models/User');

// Authentication middleware
const authenticate = (req, res, next) => {
  if (!req.session.user) {
    if (req.accepts('html')) {
        return res.redirect('/auth/login');
    }
    return res.status(401).json({ error: 'Unauthenticated. Please log in.' });
  }
  next();
};

// Authorization middleware (role-based)
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      if (req.accepts('html')) {
          return res.redirect('/auth/login');
      }
      return res.status(401).json({ error: 'Unauthenticated. Please log in.' });
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({
        error: 'Forbidden. Insufficient permissions.'
      });
    }

    next();
  };
};

// Check if user is active middleware
const checkStatus = async (req, res, next) => {
  if (!req.session.user) return next();
  
  try {
    const user = await User.findById(req.session.user.id);
    if (!user || user.status === 'inactive') {
      req.session.destroy(); // Force logout
      if (req.accepts('html') && !req.xhr) {
          return res.redirect('/auth/login');
      }
      return res.status(403).json({ error: 'Forbidden. Account is inactive.' });
    }
    next();
  } catch (err) {
    console.error('Check status error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { authenticate, authorize, checkStatus };