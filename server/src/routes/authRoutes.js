/**
 * Auth Routes
 */
const router = require('express').Router();
const passport = require('passport');
const { register, login, googleCallback, refreshTokenHandler, forgotPassword, resetPassword, getMe, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, registerRules, loginRules } = require('../middleware/validateMiddleware');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh-token', refreshTokenHandler);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

module.exports = router;
