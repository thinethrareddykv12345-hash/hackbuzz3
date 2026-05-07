/**
 * Project Model - TeamPulse AI
 */
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: 100,
    },
    description: { type: String, maxlength: 1000 },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'review', 'completed'],
      default: 'planning',
    },
    startDate: Date,
    endDate: Date,
    techStack: [String],
    repositoryUrl: String,
    peerReviewEnabled: { type: Boolean, default: false },
    aiTaskSuggestions: [
      {
        task: String,
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        priority: { type: String, enum: ['low', 'medium', 'high'] },
        status: { type: String, enum: ['suggested', 'accepted', 'completed'], default: 'suggested' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
