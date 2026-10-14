const mysql = require('mysql2');
require('dotenv').config();
const fallbackDb = require('./fallbackDb');

let activeDb = fallbackDb;
let isConnectedToMySQL = false;

// Create MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 1000,
});

const mysqlPromiseDb = pool.promise();

// Attempt connection at startup
mysqlPromiseDb
  .getConnection()
  .then((conn) => {
    activeDb = mysqlPromiseDb;
    isConnectedToMySQL = true;
    console.log(`[db] Connected to MySQL database "${process.env.DB_NAME || 'employee_db'}"`);
    conn.release();
  })
  .catch((err) => {
    console.warn(`[db] MySQL not detected (${err.message}). Using persistent local database fallback.`);
    activeDb = fallbackDb;
  });

// Unified export proxying queries to activeDb
const db = {
  getConnection: async () => {
    if (isConnectedToMySQL) {
      try {
        return await mysqlPromiseDb.getConnection();
      } catch (e) {
        return fallbackDb.getConnection();
      }
    }
    return fallbackDb.getConnection();
  },
  query: async (sql, params) => {
    if (isConnectedToMySQL) {
      try {
        return await mysqlPromiseDb.query(sql, params);
      } catch (e) {
        console.warn('[db] MySQL query error, falling back to local DB:', e.message);
        return fallbackDb.query(sql, params);
      }
    }
    return fallbackDb.query(sql, params);
  },
};

module.exports = db;

