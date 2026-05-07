/**
 * Analytics Controller - TeamPulse AI
 */
const Contribution = require('../models/Contribution');
const AIAnalysis = require('../models/AIAnalysis');
const User = require('../models/User');
const Team = require('../models/Team');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get project analytics
// @route   GET /api/analytics/project/:projectId
const getProjectAnalytics = async (req, res) => {
  const { projectId } = req.params;

  const contributions = await Contribution.find({ project: projectId })
    .populate('user', 'name avatar')
    .populate('aiAnalysis');

  // Per-member stats
  const memberStats = {};
  contributions.forEach((c) => {
    const uid = c.user._id.toString();
    if (!memberStats[uid]) {
      memberStats[uid] = {
        user: c.user,
        totalContributions: 0,
        categories: {},
        totalEffort: 0,
        totalQuality: 0,
        analyzedCount: 0,
      };
    }
    memberStats[uid].totalContributions += 1;
    memberStats[uid].categories[c.category] = (memberStats[uid].categories[c.category] || 0) + 1;

    if (c.aiAnalysis) {
      memberStats[uid].totalEffort += c.aiAnalysis.effortScore || 0;
      memberStats[uid].totalQuality += c.aiAnalysis.qualityScore || 0;
      memberStats[uid].analyzedCount += 1;
    }
  });

  // Calculate percentages and averages
  const total = contributions.length || 1;
  const members = Object.values(memberStats).map((m) => ({
    user: m.user,
    totalContributions: m.totalContributions,
    contributionPercentage: ((m.totalContributions / total) * 100).toFixed(1),
    categories: m.categories,
    avgEffort: m.analyzedCount ? (m.totalEffort / m.analyzedCount).toFixed(1) : 0,
    avgQuality: m.analyzedCount ? (m.totalQuality / m.analyzedCount).toFixed(1) : 0,
  }));

  // Category breakdown
  const categoryBreakdown = {};
  contributions.forEach((c) => {
    categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
  });

  // Daily activity (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const dailyActivity = await Contribution.aggregate([
    { $match: { project: contributions[0]?.project || null, createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  successResponse(res, 200, 'Analytics fetched', {
    totalContributions: contributions.length,
    members,
    categoryBreakdown,
    dailyActivity,
  });
};

// @desc    Get contribution heatmap data
// @route   GET /api/analytics/heatmap/:projectId
const getHeatmap = async (req, res) => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000);

  const heatmap = await Contribution.aggregate([
    { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(req.params.projectId), createdAt: { $gte: ninetyDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  successResponse(res, 200, 'Heatmap data', { heatmap });
};

// @desc    Get team health score
// @route   GET /api/analytics/health/:teamId
const getTeamHealth = async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  if (!team) return errorResponse(res, 404, 'Team not found');

  const contributions = await Contribution.find({ team: req.params.teamId })
    .populate('aiAnalysis');

  const memberCounts = {};
  contributions.forEach((c) => {
    const uid = c.user.toString();
    memberCounts[uid] = (memberCounts[uid] || 0) + 1;
  });

  const counts = Object.values(memberCounts);
  const avg = counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
  const variance = counts.length
    ? counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length
    : 0;
  const balanceScore = Math.max(0, 100 - variance * 2);

  // Update team health
  team.healthScore = Math.round(balanceScore);
  await team.save();

  successResponse(res, 200, 'Team health', {
    healthScore: Math.round(balanceScore),
    memberActivity: memberCounts,
    totalContributions: contributions.length,
  });
};

const axios = require('axios');

// ... existing code ...

// @desc    Get AI team insights
// @route   GET /api/analytics/insights/:projectId
const getProjectInsights = async (req, res) => {
  try {
    const { projectId } = req.params;
    const contributions = await Contribution.find({ project: projectId }).populate('aiAnalysis');

    if (contributions.length === 0) {
      return successResponse(res, 200, 'No contributions yet', {
        insights: { overall_health: "Waiting for first contributions...", ghost_members: [] }
      });
    }

    const aiData = contributions.map(c => ({
      text: c.description,
      category: c.category,
      user_id: c.user.toString()
    }));

    const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/insights`, aiData);
    successResponse(res, 200, 'AI Insights fetched', { insights: aiRes.data });
  } catch (err) {
    console.error('AI Service Error:', err.message);
    successResponse(res, 200, 'AI Service unavailable', { 
      insights: { overall_health: "AI analysis is currently processing. Check back soon!", ghost_members: [] } 
    });
  }
};

module.exports = { getProjectAnalytics, getHeatmap, getTeamHealth, getProjectInsights };
