/**
 * Validation Middleware using express-validator
 */
const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation Errors:', errors.array().map(e => `${e.path}: ${e.msg}`));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Contribution validators
const contributionRules = [
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 500 }),
  body('category')
    .isIn(['frontend', 'backend', 'testing', 'documentation', 'research', 'deployment', 'design', 'other'])
    .withMessage('Valid category is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
];

// Team validators
const createTeamRules = [
  body('name').trim().notEmpty().withMessage('Team name is required'),
];

// Project validators
const createProjectRules = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('teamId').notEmpty().withMessage('Team ID is required'),
];

// Peer review validators
const peerReviewRules = [
  body('revieweeId').notEmpty().withMessage('Reviewee ID is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('ratings.communication').isInt({ min: 1, max: 5 }),
  body('ratings.reliability').isInt({ min: 1, max: 5 }),
  body('ratings.workQuality').isInt({ min: 1, max: 5 }),
  body('ratings.teamwork').isInt({ min: 1, max: 5 }),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  contributionRules,
  createTeamRules,
  createProjectRules,
  peerReviewRules,
};
