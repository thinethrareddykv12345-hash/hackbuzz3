/**
 * Contribution Controller - TeamPulse AI
 */
const Contribution = require('../models/Contribution');
const Project = require('../models/Project');
const Team = require('../models/Team');
const User = require('../models/User');
const AIAnalysis = require('../models/AIAnalysis');
const Notification = require('../models/Notification');
const axios = require('axios');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

// @desc    Create contribution
// @route   POST /api/contributions
const createContribution = async (req, res) => {
  const { description, category, projectId, githubLink, hoursSpent } = req.body;

  const project = await Project.findById(projectId);
  if (!project) return errorResponse(res, 404, 'Project not found');

  // Build attachments
  const attachments = [];
  if (req.files && req.files.length > 0) {
    req.files.forEach((file) => {
      attachments.push({
        url: file.path,
        publicId: file.filename,
        fileType: file.mimetype,
        fileName: file.originalname,
      });
    });
  }

  const contribution = await Contribution.create({
    user: req.user._id,
    project: projectId,
    team: project.team,
    description,
    category,
    attachments,
    githubLink,
    hoursSpent,
  });

  // Update user streaks & stats
  const user = await User.findById(req.user._id);
  user.totalContributions += 1;
  
  const today = new Date().toDateString();
  const lastDate = user.lastContributionDate ? user.lastContributionDate.toDateString() : null;

  if (lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === yesterday) {
      user.contributionStreak += 1;
    } else {
      user.contributionStreak = 1;
    }
    user.lastContributionDate = new Date();
    if (user.contributionStreak > user.longestStreak) {
      user.longestStreak = user.contributionStreak;
    }
  }
  await user.save();

  // AI Analysis Trigger (Non-blocking)
  try {
    const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-contribution`, {
      description,
      category,
      githubLink,
      hoursSpent,
    });

    if (aiRes.data) {
      const analysis = await AIAnalysis.create({
        contribution: contribution._id,
        user: req.user._id,
        project: projectId,
        ...aiRes.data
      });
      contribution.aiAnalysis = analysis._id;
      await contribution.save();
    }
  } catch (error) {
    logger.warn('AI Analysis failed:', error.message);
  }

  // Socket Notify
  try {
    const io = getIO();
    io.to(`project-${projectId}`).emit('contribution-added', {
      contribution,
      user: { name: req.user.name, avatar: req.user.avatar }
    });
  } catch (e) {}

  successResponse(res, 201, 'Contribution logged', { contribution });
};

// @desc    Get contributions for a project
// @route   GET /api/contributions/project/:projectId
const getProjectContributions = async (req, res) => {
  const contributions = await Contribution.find({ project: req.params.projectId })
    .populate('user', 'name avatar')
    .populate('aiAnalysis')
    .sort('-createdAt');
  successResponse(res, 200, 'Contributions fetched', { contributions });
};

// @desc    Get my contributions
// @route   GET /api/contributions/my
const getMyContributions = async (req, res) => {
  const contributions = await Contribution.find({ user: req.user._id })
    .populate('project', 'title')
    .populate('aiAnalysis')
    .sort('-createdAt');
  successResponse(res, 200, 'My contributions fetched', { contributions });
};

// @desc    Add reaction
// @route   POST /api/contributions/:id/react
const addReaction = async (req, res) => {
  const { emoji } = req.body;
  const contribution = await Contribution.findById(req.params.id);
  if (!contribution) return errorResponse(res, 404, 'Contribution not found');

  contribution.reactions.push({ user: req.user._id, emoji });
  await contribution.save();
  successResponse(res, 200, 'Reaction added');
};

// @desc    Delete contribution
// @route   DELETE /api/contributions/:id
const deleteContribution = async (req, res) => {
  const contribution = await Contribution.findById(req.params.id);
  if (!contribution) return errorResponse(res, 404, 'Contribution not found');
  if (contribution.user.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Unauthorized');
  }
  await contribution.deleteOne();
  successResponse(res, 200, 'Contribution deleted');
};

module.exports = {
  createContribution,
  getProjectContributions,
  getMyContributions,
  addReaction,
  deleteContribution,
};
