/**
 * AI Controller - Proxy to AI microservice
 */
const axios = require('axios');
const WeeklySummary = require('../models/WeeklySummary');
const Contribution = require('../models/Contribution');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Generate weekly summary
const generateWeeklySummary = async (req, res) => {
  const { projectId, teamId } = req.body;
  const weekStart = new Date(Date.now() - 7 * 86400000);

  const contributions = await Contribution.find({
    project: projectId, createdAt: { $gte: weekStart },
  }).populate('user', 'name').populate('aiAnalysis');

  const logs = contributions.map((c) => ({
    user: c.user.name,
    description: c.description,
    category: c.category,
    date: c.createdAt,
    analysis: c.aiAnalysis ? {
      effort: c.aiAnalysis.effortScore,
      quality: c.aiAnalysis.qualityScore,
    } : null,
  }));

  try {
    const aiRes = await axios.post(`${AI_URL}/generate-summary`, { contributions: logs, projectId });
    const summary = await WeeklySummary.create({
      project: projectId,
      team: teamId,
      weekStart,
      weekEnd: new Date(),
      ...aiRes.data,
    });
    successResponse(res, 201, 'Weekly summary generated', { summary });
  } catch (error) {
    logger.error('AI summary error:', error.message);
    return errorResponse(res, 500, 'Failed to generate summary');
  }
};

// @desc    Detect contribution imbalance
const detectImbalance = async (req, res) => {
  const { projectId } = req.params;
  const contributions = await Contribution.find({ project: projectId })
    .populate('user', 'name');

  const memberLogs = {};
  contributions.forEach((c) => {
    const name = c.user.name;
    if (!memberLogs[name]) memberLogs[name] = [];
    memberLogs[name].push({ description: c.description, category: c.category, date: c.createdAt });
  });

  try {
    const aiRes = await axios.post(`${AI_URL}/detect-imbalance`, { memberLogs });
    successResponse(res, 200, 'Imbalance analysis', { insights: aiRes.data });
  } catch (error) {
    logger.error('AI imbalance error:', error.message);
    return errorResponse(res, 500, 'AI analysis unavailable');
  }
};

// @desc    Generate resume bullets
const generateResumeBullets = async (req, res) => {
  const contributions = await Contribution.find({ user: req.user._id })
    .populate('aiAnalysis')
    .sort('-createdAt')
    .limit(50);

  const logs = contributions.map((c) => ({
    description: c.description,
    category: c.category,
    analysis: c.aiAnalysis,
  }));

  try {
    const aiRes = await axios.post(`${AI_URL}/generate-resume-bullets`, { contributions: logs });
    successResponse(res, 200, 'Resume bullets', { bullets: aiRes.data.bullets });
  } catch (error) {
    return errorResponse(res, 500, 'AI service unavailable');
  }
};

// @desc    Get weekly summaries
const getWeeklySummaries = async (req, res) => {
  const summaries = await WeeklySummary.find({ project: req.params.projectId })
    .sort('-weekEnd')
    .limit(10);
  successResponse(res, 200, 'Summaries fetched', { summaries });
};

module.exports = { generateWeeklySummary, detectImbalance, generateResumeBullets, getWeeklySummaries };
