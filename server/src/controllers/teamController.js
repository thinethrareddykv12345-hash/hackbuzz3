/**
 * Team Controller - TeamPulse AI
 */
const Team = require('../models/Team');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendTeamInviteEmail } = require('../utils/email');

// @desc    Create team
// @route   POST /api/teams
const createTeam = async (req, res) => {
  const { name, description } = req.body;

  const team = await Team.create({
    name,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });

  successResponse(res, 201, 'Team created', { team });
};

// @desc    Get user's teams
// @route   GET /api/teams
const getMyTeams = async (req, res) => {
  const teams = await Team.find({ 'members.user': req.user._id })
    .populate('members.user', 'name email avatar')
    .populate('owner', 'name email avatar')
    .sort('-createdAt');

  successResponse(res, 200, 'Teams fetched', { teams });
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
const getTeamById = async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('members.user', 'name email avatar skills contributionStreak badges')
    .populate('owner', 'name email avatar');

  if (!team) return errorResponse(res, 404, 'Team not found');

  // Check membership
  const isMember = team.members.some((m) => m.user._id.toString() === req.user._id.toString());
  if (!isMember) return errorResponse(res, 403, 'Not a team member');

  successResponse(res, 200, 'Team fetched', { team });
};

// @desc    Join team via invite code
// @route   POST /api/teams/join
const joinTeam = async (req, res) => {
  const { inviteCode } = req.body;

  const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });
  if (!team) return errorResponse(res, 404, 'Invalid invite code');

  if (team.members.length >= team.maxMembers) {
    return errorResponse(res, 400, 'Team is full');
  }

  const alreadyMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
  if (alreadyMember) return errorResponse(res, 400, 'Already a member');

  team.members.push({ user: req.user._id, role: 'member' });
  await team.save();

  const populatedTeam = await Team.findById(team._id)
    .populate('members.user', 'name email avatar')
    .populate('owner', 'name email avatar');

  successResponse(res, 200, 'Joined team successfully', { team: populatedTeam });
};

// @desc    Invite member via email
// @route   POST /api/teams/:id/invite
const inviteMember = async (req, res) => {
  const { email } = req.body;
  const team = await Team.findById(req.params.id);

  if (!team) return errorResponse(res, 404, 'Team not found');
  if (team.owner.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Only the team owner can invite');
  }

  try {
    await sendTeamInviteEmail(email, team.name, team.inviteCode, req.user.name);
    successResponse(res, 200, 'Invitation sent');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to send invitation email');
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
const updateTeam = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return errorResponse(res, 404, 'Team not found');
  if (team.owner.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Only owner can update team');
  }

  const { name, description, avatar } = req.body;
  if (name) team.name = name;
  if (description !== undefined) team.description = description;
  if (avatar) team.avatar = avatar;

  await team.save();
  successResponse(res, 200, 'Team updated', { team });
};

// @desc    Remove member
// @route   DELETE /api/teams/:id/members/:userId
const removeMember = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return errorResponse(res, 404, 'Team not found');
  if (team.owner.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Only owner can remove members');
  }
  if (req.params.userId === team.owner.toString()) {
    return errorResponse(res, 400, 'Cannot remove the owner');
  }

  team.members = team.members.filter((m) => m.user.toString() !== req.params.userId);
  await team.save();
  successResponse(res, 200, 'Member removed');
};

// @desc    Post anonymous reflection
// @route   POST /api/teams/:id/reflections
const postReflection = async (req, res) => {
  const { message } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team) return errorResponse(res, 404, 'Team not found');

  team.reflectionBoard.push({ message });
  await team.save();
  successResponse(res, 201, 'Reflection posted anonymously', { reflections: team.reflectionBoard });
};

// @desc    Get reflections
// @route   GET /api/teams/:id/reflections
const getReflections = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return errorResponse(res, 404, 'Team not found');
  successResponse(res, 200, 'Reflections fetched', { reflections: team.reflectionBoard });
};

module.exports = {
  createTeam, getMyTeams, getTeamById, joinTeam,
  inviteMember, updateTeam, removeMember, postReflection, getReflections,
};
