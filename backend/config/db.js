const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Create database connection (callback style)
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'advocate_case_db'
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
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'advocate_case_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

module.exports = db;
module.exports.promise = dbPromise;
