/**
 * Contribution Routes
 */
const router = require('express').Router();
const { createContribution, getProjectContributions, getMyContributions, addReaction, deleteContribution } = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.use(protect);

// Helper to handle upload errors gracefully (e.g. if Cloudinary keys are missing)
const handleUpload = (req, res, next) => {
  upload.array('files', 5)(req, res, (err) => {
    if (err) {
      console.warn('⚠️ File upload failed (Check Cloudinary keys):', err.message);
      // Continue to create the contribution without files
      return next();
    }
    next();
  });
};

router.post('/', handleUpload, createContribution);
router.get('/project/:projectId', getProjectContributions);
router.get('/my', getMyContributions);
router.post('/:id/react', addReaction);
router.delete('/:id', deleteContribution);

module.exports = router;
