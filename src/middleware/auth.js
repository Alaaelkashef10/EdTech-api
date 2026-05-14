const jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Protects routes by verifying the JWT sent in the Authorization header.
 * Attaches the authenticated user to `req.user` on success.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach the user (without password) to the request object
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
