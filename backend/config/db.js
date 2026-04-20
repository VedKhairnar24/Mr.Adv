const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
require('dotenv').config();

// Create database connection (callback style)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || '', // Uses DB_PASSWORD from .env file
  database: 'advocate_case_db'
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('\nPlease check your MySQL credentials and ensure the database is created.');
    console.log('Run the database schema from database/schema.sql first.\n');
  } else {
    console.log('✅ MySQL Connected Successfully');
  }
});

// Create promise-based connection pool for async/await support
const dbPromise = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'advocate_case_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

module.exports = db;
module.exports.promise = dbPromise;
