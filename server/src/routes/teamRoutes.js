/**
 * Team Routes
 */
const router = require('express').Router();
const { createTeam, getMyTeams, getTeamById, joinTeam, inviteMember, updateTeam, removeMember, postReflection, getReflections } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { validate, createTeamRules } = require('../middleware/validateMiddleware');

router.use(protect);
router.post('/', createTeamRules, validate, createTeam);
router.get('/', getMyTeams);
router.get('/:id', getTeamById);
router.post('/join', joinTeam);
router.post('/:id/invite', inviteMember);
router.put('/:id', updateTeam);
router.delete('/:id/members/:userId', removeMember);
router.post('/:id/reflections', postReflection);
router.get('/:id/reflections', getReflections);

module.exports = router;
