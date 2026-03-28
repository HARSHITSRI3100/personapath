const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes – verifies JWT from Authorization header.
 * Attaches user object to req.user on success.
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized – no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Not authorized – user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT error:', error.message);
    return res.status(401).json({ error: 'Not authorized – invalid token' });
  }
};

module.exports = { protect };
