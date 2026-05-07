/**
 * Analytics Routes
 */
const router = require('express').Router();
const { getProjectAnalytics, getHeatmap, getTeamHealth, getProjectInsights } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/project/:projectId', getProjectAnalytics);
router.get('/heatmap/:projectId', getHeatmap);
router.get('/health/:teamId', getTeamHealth);
router.get('/insights/:projectId', getProjectInsights);

module.exports = router;
