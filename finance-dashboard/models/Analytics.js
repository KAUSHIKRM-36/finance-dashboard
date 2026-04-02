const pool = require('../config/database');

class Analytics {
  /**
   * Calculates Month-over-Month (MoM) performance stats.
   * Compares the current calendar month sums against the previous calendar month.
   * @returns {Promise<Array>} Array of objects containing type, current month sum, and previous month sum.
   */
  static async getMoMStats() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(`
        SELECT 
          type,
          SUM(CASE WHEN date >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN amount ELSE 0 END) as current_month,
          SUM(CASE WHEN date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') 
                    AND date < DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN amount ELSE 0 END) as previous_month
        FROM financial_records
        GROUP BY type
      `);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Simple Anomaly Detection Engine.
   * Identifies expense categories that have spiked by more than 50% compared to the previous month.
   * Logic: Uses a Common Table Expression (CTE) to aggregate monthly categorical data before comparison.
   * @returns {Promise<Array>} Array of anomalous category objects.
   */
  static async getAnomalies() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(`
        WITH CategoryStats AS (
          SELECT
            category,
            type,
            SUM(CASE WHEN date >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN amount ELSE 0 END) as current_month,
            SUM(CASE WHEN date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') 
                      AND date < DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN amount ELSE 0 END) as previous_month
          FROM financial_records
          GROUP BY category, type
        )
        SELECT 
          category, type, current_month, previous_month,
          ((current_month - previous_month) / previous_month) * 100 as percentage_change
        FROM CategoryStats
        WHERE previous_month > 0 
          AND type = 'expense'
          AND ((current_month - previous_month) / previous_month) > 0.50
        ORDER BY percentage_change DESC
      `);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Retrieves all raw financial records with associated owner usernames.
   * Optimized for CSV/Reporting exports.
   * @returns {Promise<Array>} Full chronological list of company records.
   */
  static async getRawRecords() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(`
        SELECT 
          r.id, r.amount, r.type, r.category, r.description, r.date,
          u.username as created_by
         FROM financial_records r
         JOIN users u ON r.user_id = u.id
         ORDER BY r.date DESC
      `);
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Analytics;
