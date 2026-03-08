const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Register a new advocate
 * POST /api/auth/register
 */
exports.register = (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: 'Name, email, and password are required' 
    });
  }

  // Hash password with salt (10 rounds)
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert into database
  const sql = 'INSERT INTO advocates (name, email, password, phone) VALUES (?, ?, ?, ?)';

  db.query(sql, [name, email, hashedPassword, phone], (err, result) => {
    if (err) {
      // Handle duplicate email error
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
          message: 'Email already exists' 
        });
      }
      console.error('Registration error:', err);
      return res.status(500).json({ 
        message: 'Registration failed',
        error: err.message 
      });
    }

    res.status(201).json({ 
      message: 'Advocate registered successfully',
      advocateId: result.insertId
    });
  });
};

/**
 * Login advocate
 * POST /api/auth/login
 */
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required' 
    });
  }

  // Find advocate by email
  const sql = 'SELECT * FROM advocates WHERE email = ?';

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Login query error:', err);
      return res.status(500).json({ 
        message: 'Login failed',
        error: err.message 
      });
    }

    // Check if advocate exists
    if (result.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    const advocate = result[0];

    // Compare passwords
    const isMatch = bcrypt.compareSync(password, advocate.password);

    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: advocate.id,
        email: advocate.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 24 hours
    );

    // Return success response (exclude password)
    res.json({
      message: 'Login successful',
      token,
      advocate: {
        id: advocate.id,
        name: advocate.name,
        email: advocate.email,
        phone: advocate.phone
      }
    });
  });
};

/**
 * Get current logged in advocate profile
 * GET /api/auth/profile
 * (Protected route - requires authentication)
 */
exports.getProfile = (req, res) => {
  // req.advocate is set by auth middleware (to be added later)
  const sql = 'SELECT id, name, email, phone, created_at FROM advocates WHERE id = ?';

  db.query(sql, [req.advocate.id], (err, result) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Failed to fetch profile',
        error: err.message 
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ 
        message: 'Advocate not found' 
      });
    }

    res.json({
      advocate: result[0]
    });
  });
};
