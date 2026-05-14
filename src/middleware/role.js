// src/middleware/role.js
const role = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const userRole = req.user.role || (req.user.is_instructor ? 'instructor' : 'student');

    // Admin has access to EVERYTHING
    if (userRole === 'admin') {
      return next();
    }

    if (roles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Only ${roles.join(' or ')} can perform this action.`
    });
  };
};

module.exports = role;


