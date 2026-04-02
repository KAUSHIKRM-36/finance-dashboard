const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Find user by username
  static async findByUsername(username) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  // Find user by id
  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, username, email, role, status, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  // Get all users
  static async findAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // Create new user
  static async create(userData) {
    const { username, email, password, role = 'viewer' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, 'active']
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user role
  static async updateRole(userId, newRole) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newRole, userId]
      );
    } finally {
      connection.release();
    }
  }

  // Update user status
  static async updateStatus(userId, newStatus) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, userId]
      );
    } finally {
      connection.release();
    }
  }

  // Delete user
  static async delete(userId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );
    } finally {
      connection.release();
    }
  }
}

module.exports = User;