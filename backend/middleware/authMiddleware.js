const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and authenticate requests
 * Protects routes that require advocate authentication
 */
const verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

  // Check if token is provided
  if (!token) {
    return res.status(403).json({ 
      message: 'Token required' 
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach advocate ID to request object
    req.advocateId = decoded.id;
    req.advocate = decoded; // Also attach full decoded data for future use
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    
    return res.status(401).json({ 
      message: 'Invalid token' 
    });
  }
};

module.exports = verifyToken;
