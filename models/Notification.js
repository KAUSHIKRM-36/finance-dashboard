const pool = require('../config/database');

class Notification {
  /**
   * Create a new notification (e.g., reactivation request).
   * @param {Object} data - { userId, type, message }
   */
  static async create(data) {
    const { userId, type = 'reactivation', message = 'User requested account reactivation' } = data;
    const connection = await pool.getConnection();
    try {
      // Check if a pending notification already exists for this user/type to avoid spam
      const [existing] = await connection.execute(
        'SELECT id FROM notifications WHERE user_id = ? AND type = ? AND status = "pending"',
        [userId, type]
      );

      if (existing.length > 0) {
        return existing[0].id; // Already requested
      }

      const [result] = await connection.execute(
        'INSERT INTO notifications (user_id, type, message, status) VALUES (?, ?, ?, "pending")',
        [userId, type, message]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all pending notifications with user details.
   */
  static async findAllPending() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT n.*, u.username, u.email 
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        WHERE n.status = 'pending'
        ORDER BY n.created_at DESC
      `);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Update notification status.
   * @param {number} id - Notification ID
   * @param {string} status - 'approved' or 'denied'
   */
  static async updateStatus(id, status) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE notifications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
    } finally {
      connection.release();
    }
  }

  /**
   * Find notification by ID.
   */
  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM notifications WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Get count of pending notifications.
   */
  static async countPending() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT COUNT(*) as count FROM notifications WHERE status = 'pending'"
      );
      return rows[0].count;
    } finally {
      connection.release();
    }
  }
}

module.exports = Notification;
