const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Security middleware
require('dotenv').config();

// Import database connection
const db = require('./config/db');

// Import authentication routes
const authRoutes = require('./routes/authRoutes');

// Import client management routes
const clientRoutes = require('./routes/clientRoutes');

// Import case management routes
const caseRoutes = require('./routes/caseRoutes');

// Import document routes
const documentRoutes = require('./routes/documentRoutes');

// Import evidence routes
const evidenceRoutes = require('./routes/evidenceRoutes');

// Import hearing routes
const hearingRoutes = require('./routes/hearingRoutes');

// Import notes routes
const noteRoutes = require('./routes/noteRoutes');

// Import dashboard routes
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import AI routes
const aiRoutes = require('./routes/aiRoutes');

// Import court routes
const courtRoutes = require('./routes/courtRoutes');

// Import settings routes
const settingsRoutes = require('./routes/settingsRoutes');

// Import insights routes
const insightsRoutes = require('./routes/insightsRoutes');

// Import test routes
const testRoutes = require('./routes/testRoutes');

// Import error handler middleware
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(helmet()); // Security headers - protects against common attacks
app.use(cors()); // Enable CORS for frontend access
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/clients', clientRoutes); // Client management routes
app.use('/api/cases', caseRoutes); // Case management routes
app.use('/api/documents', documentRoutes); // Document upload routes
app.use('/api/evidence', evidenceRoutes); // Evidence upload routes
app.use('/api/hearings', hearingRoutes); // Hearing management routes
app.use('/api/notes', noteRoutes); // Notes management routes
app.use('/api/dashboard', dashboardRoutes); // Dashboard statistics routes
app.use('/api/ai', aiRoutes); // AI legal assistant routes
app.use('/api/courts', courtRoutes); // Court management routes
app.use('/api/settings', settingsRoutes); // Settings routes
app.use('/api/insights', insightsRoutes); // Dashboard insights with AI analysis routes
app.use('/api/test', testRoutes); // Test endpoints for debugging

// Basic route test
app.get('/', (req, res) => {
  res.send('🏛️ Advocate Case Management API - Server Running Successfully!');
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Database Test Route
app.get('/api/test-db', (req, res) => {
  db.query('SELECT DATABASE() as current_db', (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: 'Database connected successfully',
      database: result[0].current_db
    });
  });
});

// 404 Handler - for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler Middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📍 Clients API: http://localhost:${PORT}/api/clients`);
  console.log(`📍 Cases API: http://localhost:${PORT}/api/cases`);
  console.log(`📍 Documents API: http://localhost:${PORT}/api/documents`);
  console.log(`📍 Evidence API: http://localhost:${PORT}/api/evidence`);
  console.log(`📍 Hearings API: http://localhost:${PORT}/api/hearings`);
  console.log(`📍 Notes API: http://localhost:${PORT}/api/notes`);
  console.log(`📍 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`📍 Files: http://localhost:${PORT}/uploads`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 DB Test: http://localhost:${PORT}/api/test-db\n`);
  console.log('Press Ctrl+C to stop the server\n');
});

module.exports = app;
