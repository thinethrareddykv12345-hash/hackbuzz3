/**
 * User Model - TeamPulse AI
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    googleId: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['student', 'lead', 'admin'],
      default: 'student',
    },
    bio: { type: String, maxlength: 200 },
    skills: [String],
    githubUsername: String,

    // Gamification
    contributionStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastContributionDate: Date,
    totalContributions: { type: Number, default: 0 },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
        description: String,
      },
    ],

    // OTP for password reset
    resetOtp: String,
    resetOtpExpiry: Date,
    refreshToken: String,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
