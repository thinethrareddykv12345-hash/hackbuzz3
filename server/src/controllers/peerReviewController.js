/**
 * Peer Review Controller - TeamPulse AI
 */
const PeerReview = require('../models/PeerReview');
const Project = require('../models/Project');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Submit peer review
// @route   POST /api/peer-reviews
const submitReview = async (req, res) => {
  const { revieweeId, projectId, ratings, comment, isAnonymous } = req.body;

  // Check if already reviewed for this project
  const existingReview = await PeerReview.findOne({
    reviewer: req.user._id,
    reviewee: revieweeId,
    project: projectId,
  });

  if (existingReview) {
    return errorResponse(res, 400, 'You have already reviewed this teammate for this project');
  }

  const review = await PeerReview.create({
    reviewer: req.user._id,
    reviewee: revieweeId,
    project: projectId,
    ratings,
    comment,
    isAnonymous: isAnonymous !== undefined ? isAnonymous : true,
  });

  // Trigger AI Summary update for the reviewee (Non-blocking)
  const updateAiSummary = async () => {
    try {
      const axios = require('axios');
      const allReviews = await PeerReview.find({ reviewee: revieweeId, project: projectId });
      const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/summarize-feedback`, 
        allReviews.map(r => ({ ratings: r.ratings, comment: r.comment }))
      );
      
      await PeerReview.updateMany(
        { reviewee: revieweeId, project: projectId },
        { aiSummary: aiRes.data.summary }
      );
    } catch (err) {
      console.error('AI Summary failed:', err.message);
    }
  };
  
  updateAiSummary();

  successResponse(res, 201, 'Review submitted successfully', { review });
};

// @desc    Get reviews for a user in a project
// @route   GET /api/peer-reviews/project/:projectId
const getMyReviews = async (req, res) => {
  const { projectId } = req.params;
  const revieweeId = req.user._id;

  let reviews = await PeerReview.find({
    reviewee: revieweeId,
    project: projectId,
  });

  // If no summary exists yet, try to generate one now
  if (reviews.length > 0 && !reviews[0].aiSummary) {
    try {
      const axios = require('axios');
      console.log(`📡 Requesting AI Summary from: ${process.env.AI_SERVICE_URL}/summarize-feedback`);
      
      const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/summarize-feedback`, 
        reviews.map(r => ({ ratings: r.ratings, comment: r.comment }))
      );
      
      const summary = aiRes.data.summary;
      console.log('✅ AI Summary generated successfully');
      
      await PeerReview.updateMany(
        { reviewee: revieweeId, project: projectId },
        { aiSummary: summary }
      );
      
      // Update local reviews object to show the new summary
      reviews = reviews.map(r => ({ ...r._doc, aiSummary: summary }));
    } catch (err) {
      console.error('⚠️ On-demand AI Summary failed:', err.message);
    }
  }

  successResponse(res, 200, 'Reviews fetched', { reviews });
};

module.exports = { submitReview, getMyReviews };
