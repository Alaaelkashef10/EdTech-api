const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ─── Helper ───────────────────────────────────────────────────────────────────
/**
 * Signs a JWT for the given user ID.
 * @param {string} id - MongoDB ObjectId of the user
 * @returns {string} Signed JWT string
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/users/register
 * @access  Public
 * @desc    Register a new user (student or instructor)
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password, is_instructor } = req.body;

  // Prevent duplicate accounts
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already in use', 400);
  }

  const user = await User.create({ 
    username, 
    email, 
    password, 
    is_instructor,
    role: is_instructor ? 'instructor' : 'student'   // Default role
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      id:            user._id,
      username:      user.username,
      email:         user.email,
      is_instructor: user.is_instructor,
      role:          user.role                     // ← Added
    },
  });
});

/**
 * @route   POST /api/users/login
 * @access  Public
 * @desc    Authenticate user and return a JWT
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Return the same error for both "not found" and "wrong password"
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      id:            user._id,
      username:      user.username,
      email:         user.email,
      is_instructor: user.is_instructor,
      role:          user.role || 'student'        // ← Added (important!)
    },
  });
});

/**
 * @route   GET /api/users/me
 * @access  Private
 * @desc    Get the profile of the currently logged-in user
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  res.json({ 
    success: true, 
    user: {
      id:            user._id,
      username:      user.username,
      email:         user.email,
      is_instructor: user.is_instructor,
      role:          user.role || 'student'
    }
  });
});

module.exports = { register, login, getMe };