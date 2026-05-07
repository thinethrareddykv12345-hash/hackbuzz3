/**
 * Contribution Model - TeamPulse AI
 */
const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Contribution description is required'],
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'testing', 'documentation', 'research', 'deployment', 'design', 'other'],
      required: true,
    },
    attachments: [
      {
        url: String,
        publicId: String,
        fileType: String,
        fileName: String,
      },
    ],
    githubLink: String,
    hoursSpent: { type: Number, min: 0, max: 24 },
    // AI Analysis fields (populated after AI processing)
    aiAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIAnalysis',
    },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient querying
contributionSchema.index({ project: 1, user: 1, createdAt: -1 });

module.exports = mongoose.model('Contribution', contributionSchema);
