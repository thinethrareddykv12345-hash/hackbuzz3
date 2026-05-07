/**
 * AIAnalysis Model - TeamPulse AI
 * Stores Gemini AI analysis results per contribution
 */
const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
  {
    contribution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contribution',
      required: true,
    },
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
    // AI-generated scores
    difficultyScore: { type: Number, min: 1, max: 10 },
    effortScore: { type: Number, min: 1, max: 10 },
    qualityScore: { type: Number, min: 1, max: 10 },
    overallScore: { type: Number, min: 1, max: 10 },
    // AI-detected metadata
    detectedCategory: String,
    skillsUsed: [String],
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    sentimentScore: { type: Number, min: -1, max: 1 },
    // AI-generated text
    summary: String,
    feedback: String, // Supportive feedback
    resumeBullet: String,
    // Flags
    isRepetitive: { type: Boolean, default: false },
    isLowEffort: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
