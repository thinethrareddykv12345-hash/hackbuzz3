/**
 * AI Routes
 */
const router = require('express').Router();
const { generateWeeklySummary, detectImbalance, generateResumeBullets, getWeeklySummaries } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/weekly-summary', generateWeeklySummary);
router.get('/imbalance/:projectId', detectImbalance);
router.get('/resume-bullets', generateResumeBullets);
router.get('/summaries/:projectId', getWeeklySummaries);

module.exports = router;
