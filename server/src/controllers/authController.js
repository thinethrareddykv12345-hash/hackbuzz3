/**
 * Auth Controller - TeamPulse AI
 */
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/generateToken');
const { sendOtpEmail } = require('../utils/email');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  console.log('📦 Incoming Registration Data:', req.body);
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 400, 'Email already registered');
  }

  try {
    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    successResponse(res, 201, 'Registration successful', {
      user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('❌ Registration Database Error:', error.message);
    return errorResponse(res, 400, error.message || 'Registration failed');
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  successResponse(res, 200, 'Login successful', {
    user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, skills: user.skills, badges: user.badges, contributionStreak: user.contributionStreak },
    accessToken,
    refreshToken,
  });
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
const googleCallback = async (req, res) => {
  const user = req.user;
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  // Redirect to frontend with tokens
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
const refreshTokenHandler = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return errorResponse(res, 400, 'Refresh token required');

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 401, 'Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    successResponse(res, 200, 'Token refreshed', { accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired refresh token');
  }
};

// @desc    Forgot password — send OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return errorResponse(res, 404, 'No account with that email');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOtp = otp;
  user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  try {
    await sendOtpEmail(user.email, otp, user.name);
    successResponse(res, 200, 'OTP sent to your email');
  } catch (error) {
    logger.error('Email send error:', error);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();
    return errorResponse(res, 500, 'Failed to send email');
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetOtp: otp,
    resetOtpExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return errorResponse(res, 400, 'Invalid or expired OTP');
  }

  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  successResponse(res, 200, 'Password reset successful');
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  successResponse(res, 200, 'Profile fetched', { user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, bio, skills, githubUsername, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (skills) user.skills = skills;
  if (githubUsername !== undefined) user.githubUsername = githubUsername;
  if (avatar) user.avatar = avatar;

  await user.save();
  successResponse(res, 200, 'Profile updated', { user });
};

// @desc    Logout
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
  successResponse(res, 200, 'Logged out');
};

module.exports = {
  register, login, googleCallback, refreshTokenHandler,
  forgotPassword, resetPassword, getMe, updateProfile, logout,
};
