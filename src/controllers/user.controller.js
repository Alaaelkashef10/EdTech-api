const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ─── Helper ───────────────────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/users/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password, is_instructor } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already in use', 400);
  }

  const user = await User.create({ 
    username, 
    email, 
    password, 
    is_instructor,
    role: is_instructor ? 'instructor' : 'student'
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      is_instructor: user.is_instructor,
      role: user.role
    },
  });
});

/**
 * @route   POST /api/users/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      is_instructor: user.is_instructor,
      role: user.role || 'student'
    },
  });
});

/**
 * @route   GET /api/users/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  res.json({ 
    success: true, 
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      is_instructor: user.is_instructor,
      role: user.role || 'student'
    }
  });
});

/**
 * @route   PUT /api/users/me
 * @access  Private
 * @desc    Update own profile (username, email, password)
 */
const updateMe = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check email uniqueness if changing
  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('Email already in use', 400);
    }
    user.email = email;
  }

  if (username) user.username = username;
  if (password) user.password = password; // Will be hashed by pre-save hook

  await user.save();

  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      is_instructor: user.is_instructor,
      role: user.role || 'student'
    }
  });
});

/**
 * @route   DELETE /api/users/me
 * @access  Private
 * @desc    Delete own account
 */
const deleteMe = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ success: true, message: 'Account deleted successfully' });
});

module.exports = { register, login, getMe, updateMe, deleteMe };