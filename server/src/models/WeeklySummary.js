/**
 * WeeklySummary Model - TeamPulse AI
 */
const mongoose = require('mongoose');

const weeklySummarySchema = new mongoose.Schema(
  {
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
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    // AI-generated content
    completedWork: [String],
    pendingTasks: [String],
    teamInsights: String,
    mostActiveAreas: [String],
    potentialBlockers: [String],
    memberHighlights: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        highlight: String,
      },
    ],
    overallSentiment: String,
    healthScore: { type: Number, min: 0, max: 100 },
    contributionBalance: String, // AI diplomatic assessment
    rawSummary: String, // Full AI-generated narrative
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeeklySummary', weeklySummarySchema);
