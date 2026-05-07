/**
 * PeerReview Model - TeamPulse AI
 */
const mongoose = require('mongoose');

const peerReviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratings: {
      effort: { type: Number, min: 1, max: 5, required: true },
      quality: { type: Number, min: 1, max: 5, required: true },
      collaboration: { type: Number, min: 1, max: 5, required: true },
    },
    comment: { type: String, maxlength: 500 },
    aiSummary: String,
  },
  { timestamps: true }
);

// Ensure one review per reviewer-reviewee pair per project
peerReviewSchema.index({ project: 1, reviewer: 1, reviewee: 1 }, { unique: true });

module.exports = mongoose.model('PeerReview', peerReviewSchema);
