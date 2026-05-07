/**
 * Peer Review Routes
 */
const router = require('express').Router();
const { submitReview, getMyReviews } = require('../controllers/peerReviewController');
const { protect } = require('../middleware/authMiddleware');
const { validate, peerReviewRules } = require('../middleware/validateMiddleware');

router.use(protect);
router.post('/', peerReviewRules, validate, submitReview);
router.get('/project/:projectId', getMyReviews);

module.exports = router;
