const User = require('../models/User');

// Login handler
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).render('login', {
        message: 'Username and password are required'
      });
    }

    // Find user by username
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).render('login', {
        message: 'Username or password is incorrect'
      });
    }

    // Check if user is active
    if (user.status === 'inactive') {
      return res.status(401).render('login', {
        message: 'Your account has been deactivated. Contact admin.'
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).render('login', {
        message: 'Username or password is incorrect'
      });
    }

    // Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).render('login', {
          message: 'An error occurred during login setup'
        });
      }
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', {
      message: 'An error occurred during login'
    });
  }
};

// Register handler
exports.register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Validation
    if (!username || !email || !password || !passwordConfirm) {
      return res.status(400).render('register', {
        message: 'All fields are required'
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).render('register', {
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).render('register', {
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).render('register', {
        message: 'Username already exists'
      });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).render('register', {
        message: 'Email already exists'
      });
    }

    // Create user
    await User.create({
      username,
      email,
      password
    });

    return res.status(201).render('register', {
      message: 'User created successfully! Please log in.'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).render('register', {
      message: 'An error occurred during registration'
    });
  }
};

// Logout handler
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.redirect('/auth/login');
  });
};

// Show login page
exports.showLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { message: '' });
};

// Show register page
exports.showRegister = (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('register', { message: '' });
};