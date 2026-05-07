/**
 * Peer Review Controller - TeamPulse AI
 */
const PeerReview = require('../models/PeerReview');
const Project = require('../models/Project');
const axios = require('axios');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// @desc    Submit peer review
// @route   POST /api/peer-reviews
const submitReview = async (req, res) => {
  const { projectId, revieweeId, ratings, comment } = req.body;

  if (revieweeId === req.user._id.toString()) {
    return errorResponse(res, 400, 'Cannot review yourself');
  }

  const existing = await PeerReview.findOne({
    project: projectId, reviewer: req.user._id, reviewee: revieweeId,
  });
  if (existing) return errorResponse(res, 400, 'Already reviewed this teammate');

  let aiSummary = '';
  try {
    const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-sentiment`, {
      text: comment || '',
      ratings,
    });
    aiSummary = aiRes.data?.summary || '';
  } catch (e) {
    logger.warn('AI sentiment analysis failed:', e.message);
  }

  const review = await PeerReview.create({
    project: projectId,
    reviewer: req.user._id,
    reviewee: revieweeId,
    ratings,
    comment,
    aiSummary,
  });

  successResponse(res, 201, 'Review submitted', { review });
};

// @desc    Get reviews for a user in a project (anonymous)
// @route   GET /api/peer-reviews/project/:projectId/user/:userId
const getUserReviews = async (req, res) => {
  const reviews = await PeerReview.find({
    project: req.params.projectId,
    reviewee: req.params.userId,
  }).select('-reviewer -__v');

  const avgRatings = { communication: 0, reliability: 0, workQuality: 0, teamwork: 0 };
  if (reviews.length > 0) {
    reviews.forEach((r) => {
      avgRatings.communication += r.ratings.communication;
      avgRatings.reliability += r.ratings.reliability;
      avgRatings.workQuality += r.ratings.workQuality;
      avgRatings.teamwork += r.ratings.teamwork;
    });
    Object.keys(avgRatings).forEach((k) => {
      avgRatings[k] = (avgRatings[k] / reviews.length).toFixed(1);
    });
  }

  successResponse(res, 200, 'Reviews fetched', {
    reviewCount: reviews.length,
    avgRatings,
    reviews: reviews.map((r) => ({
      ratings: r.ratings,
      aiSummary: r.aiSummary,
      createdAt: r.createdAt,
    })),
  });
};

// @desc    Check if user has completed reviews
// @route   GET /api/peer-reviews/status/:projectId
const getReviewStatus = async (req, res) => {
  const reviews = await PeerReview.find({
    project: req.params.projectId,
    reviewer: req.user._id,
  }).select('reviewee');

  successResponse(res, 200, 'Review status', {
    reviewedUsers: reviews.map((r) => r.reviewee),
  });
};

module.exports = { submitReview, getUserReviews, getReviewStatus };
