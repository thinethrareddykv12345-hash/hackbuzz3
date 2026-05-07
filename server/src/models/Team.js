/**
 * Team Model - TeamPulse AI
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      maxlength: 60,
    },
    description: { type: String, maxlength: 300 },
    inviteCode: {
      type: String,
      unique: true,
      default: () => uuidv4().slice(0, 8).toUpperCase(),
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    maxMembers: { type: Number, default: 10 },
    avatar: String,
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
    reflectionBoard: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
        // Anonymous — no user reference
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
