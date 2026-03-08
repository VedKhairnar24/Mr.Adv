const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 * Protects routes that require authentication
 */
const authenticateToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.advocate = decoded;
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    
    return res.status(403).json({ 
      message: 'Invalid token' 
    });
  }
};

module.exports = authenticateToken;
