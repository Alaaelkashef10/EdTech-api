const role = (...roles) => {
  return (req, res, next) => {
    if (roles.includes('instructor') && !req.user.is_instructor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only instructors can perform this action.',
      });
    }
    next();
  };
};

module.exports = role;