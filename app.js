const express = require('express');
const path = require('path');
const session = require('express-session');
const pool = require('./config/database');
require('dotenv').config();

const app = express();

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration - Memory Store (No Database)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Routes
const { checkStatus } = require('./middlewares/auth');

app.use(checkStatus); // Block 'inactive' users globally

// Global Notification Count Middleware (for Admins)
const Notification = require('./models/Notification');
app.use(async (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        try {
            res.locals.pendingCount = await Notification.countPending();
        } catch (error) {
            console.error('Error fetching notification count:', error);
            res.locals.pendingCount = 0;
        }
    } else {
        res.locals.pendingCount = 0;
    }
    next();
});

app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/records', require('./routes/records'));
app.use('/users', require('./routes/users'));
app.use('/analytics', require('./routes/analytics'));

// Home route
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.redirect('/auth/login');
});

// Centralized Error Handling
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint Not Found' });
});

app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    const status = err.status || 500;
    const message = status === 500 ? 'Internal Server Error' : err.message;
    
    res.status(status).json({
        success: false,
        error: message
    });
});

module.exports = app;