/**
 * Project Routes
 */
const router = require('express').Router();
const { createProject, getTeamProjects, getProjectById, updateProject, deleteProject, getMyProjects } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { validate, createProjectRules } = require('../middleware/validateMiddleware');

router.use(protect);
router.post('/', createProjectRules, validate, createProject);
router.get('/my', getMyProjects);
router.get('/team/:teamId', getTeamProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
