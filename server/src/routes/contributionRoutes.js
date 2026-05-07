/**
 * Contribution Routes
 */
const router = require('express').Router();
const { createContribution, getProjectContributions, getMyContributions, addReaction, deleteContribution } = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.post('/', upload.array('files', 5), createContribution);
router.get('/project/:projectId', getProjectContributions);
router.get('/my', getMyContributions);
router.post('/:id/react', addReaction);
router.delete('/:id', deleteContribution);

module.exports = router;
