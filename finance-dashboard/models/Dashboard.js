const pool = require('../config/database');

class Dashboard {
  // Get total income
  static async getTotalIncome() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT SUM(amount) as total FROM financial_records WHERE type = "income"'
      );
      return rows[0].total || 0;
    } finally {
      connection.release();
    }
  }

  // Get total expense
  static async getTotalExpense() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT SUM(amount) as total FROM financial_records WHERE type = "expense"'
      );
      return rows[0].total || 0;
    } finally {
      connection.release();
    }
  }

  // Get category breakdown
  static async getCategoryBreakdown() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT category, type, SUM(amount) as total 
         FROM financial_records 
         GROUP BY category, type 
         ORDER BY total DESC`
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get monthly trends
  static async getMonthlyTrends(months = 12) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          DATE_FORMAT(date, '%Y-%m') as month,
          type,
          SUM(amount) as total
         FROM financial_records
         WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
         GROUP BY DATE_FORMAT(date, '%Y-%m'), type
         ORDER BY month DESC`,
        [months]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get recent transactions - FIXED
  static async getRecentTransactions(limit = 10) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          r.id, r.amount, r.type, r.category, r.description, r.date,
          u.username
         FROM financial_records r
         JOIN users u ON r.user_id = u.id
         ORDER BY r.created_at DESC
         LIMIT ?`,
        [parseInt(limit)]  // Make sure limit is an integer
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Dashboard;