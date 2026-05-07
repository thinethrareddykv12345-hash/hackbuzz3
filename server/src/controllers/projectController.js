/**
 * Project Controller - TeamPulse AI
 */
const Project = require('../models/Project');
const Team = require('../models/Team');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create project
// @route   POST /api/projects
const createProject = async (req, res) => {
  const { title, description, teamId, techStack, startDate, endDate, repositoryUrl, peerReviewEnabled } = req.body;

  let finalTeamId = teamId;

  // Auto-create a team if none provided
  if (!finalTeamId) {
    const newTeam = await Team.create({
      name: `${title} Team`,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      inviteCode: Math.random().toString(36).substring(2, 9).toUpperCase()
    });
    finalTeamId = newTeam._id;
  } else {
    const team = await Team.findById(teamId);
    if (!team) return errorResponse(res, 404, 'Team not found');

    const isMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return errorResponse(res, 403, 'Not a team member');
  }

  const project = await Project.create({
    title,
    description,
    team: finalTeamId,
    createdBy: req.user._id,
    techStack,
    startDate: startDate || Date.now(),
    endDate,
    repositoryUrl,
    peerReviewEnabled,
  });

  successResponse(res, 201, 'Project created', { project });
};

// @desc    Get projects for a team
// @route   GET /api/projects/team/:teamId
const getTeamProjects = async (req, res) => {
  const projects = await Project.find({ team: req.params.teamId })
    .populate('createdBy', 'name avatar')
    .sort('-createdAt');

  successResponse(res, 200, 'Projects fetched', { projects });
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name avatar email')
    .populate('team', 'name members')
    .populate('aiTaskSuggestions.assignedTo', 'name avatar');

  if (!project) return errorResponse(res, 404, 'Project not found');

  successResponse(res, 200, 'Project fetched', { project });
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return errorResponse(res, 404, 'Project not found');

  const { title, description, status, startDate, endDate, techStack, repositoryUrl, peerReviewEnabled } = req.body;

  if (title) project.title = title;
  if (description !== undefined) project.description = description;
  if (status) project.status = status;
  if (startDate) project.startDate = startDate;
  if (endDate) project.endDate = endDate;
  if (techStack) project.techStack = techStack;
  if (repositoryUrl !== undefined) project.repositoryUrl = repositoryUrl;
  if (peerReviewEnabled !== undefined) project.peerReviewEnabled = peerReviewEnabled;

  await project.save();
  successResponse(res, 200, 'Project updated', { project });
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return errorResponse(res, 404, 'Project not found');

  if (project.createdBy.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Only the creator can delete');
  }

  await project.deleteOne();
  successResponse(res, 200, 'Project deleted');
};

// @desc    Get my projects (across all teams)
// @route   GET /api/projects/my
const getMyProjects = async (req, res) => {
  const teams = await Team.find({ 'members.user': req.user._id }).select('_id');
  const teamIds = teams.map((t) => t._id);

  const projects = await Project.find({ team: { $in: teamIds } })
    .populate('team', 'name')
    .populate('createdBy', 'name avatar')
    .sort('-updatedAt');

  successResponse(res, 200, 'My projects fetched', { projects });
};

module.exports = {
  createProject, getTeamProjects, getProjectById,
  updateProject, deleteProject, getMyProjects,
};
