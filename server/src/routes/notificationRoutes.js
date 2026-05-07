/**
 * Notification Routes
 */
const router = require('express').Router();
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllRead);

module.exports = router;
