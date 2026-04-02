const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// TiDB Cloud Serverless requires SSL for remote connections
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: true
  };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;