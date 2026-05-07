/**
 * Analytics Routes
 */
const router = require('express').Router();
const { getProjectAnalytics, getHeatmap, getTeamHealth } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/project/:projectId', getProjectAnalytics);
router.get('/heatmap/:projectId', getHeatmap);
router.get('/health/:teamId', getTeamHealth);

module.exports = router;
