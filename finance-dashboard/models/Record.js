const pool = require('../config/database');

class Record {
  /**
   * Retrieves all company records with optional filtering.
   * Logic: Dynamically builds SQL WHERE clauses based on provided filter keys.
   * @param {Object} filters - Optional filters: category, type, dateFrom, dateTo.
   * @returns {Promise<Array>} List of financial records.
   */
  static async getAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          r.id, r.user_id, r.amount, r.type, r.category, 
          r.description, r.date, r.created_at, r.updated_at,
          u.username as created_by
        FROM financial_records r
        JOIN users u ON r.user_id = u.id
        WHERE 1=1
      `;
      let params = [];

      // Apply filters
      if (filters.category) {
        query += ' AND r.category = ?';
        params.push(filters.category);
      }
      if (filters.type) {
        query += ' AND r.type = ?';
        params.push(filters.type);
      }
      if (filters.dateFrom) {
        query += ' AND r.date >= ?';
        params.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        query += ' AND r.date <= ?';
        params.push(filters.dateTo);
      }

      query += ' ORDER BY r.date DESC, r.created_at DESC';

      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Fetches a specific record including owner metadata.
   * @param {number} recordId 
   * @returns {Promise<Object|null>} The record or null if not found.
   */
  static async getById(recordId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT r.*, u.username as created_by 
         FROM financial_records r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.id = ?`,
        [recordId]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Inserts a new financial record into the database.
   * @param {Object} recordData - amount, type, category, description, date, userId.
   * @returns {Promise<number>} The new record ID.
   */
  static async create(recordData) {
    const { userId, amount, type, category, description, date } = recordData;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO financial_records 
         (user_id, amount, type, category, description, date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, amount, type, category, description || null, date]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Updates an existing record.
   * Logic: Accepts partial or full data objects.
   * @param {number} recordId 
   * @param {Object} recordData 
   */
  static async update(recordId, recordData) {
    const { amount, type, category, description, date } = recordData;

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE financial_records 
         SET amount = ?, type = ?, category = ?, description = ?, date = ?, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [amount, type, category, description || null, date, recordId]
      );
    } finally {
      connection.release();
    }
  }

  /**
   * Permanently deletes a record.
   * @param {number} recordId 
   */
  static async delete(recordId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'DELETE FROM financial_records WHERE id = ?',
        [recordId]
      );
    } finally {
      connection.release();
    }
  }
}

module.exports = Record;