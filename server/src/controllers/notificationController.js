/**
 * Notification Controller - TeamPulse AI
 */
const Notification = require('../models/Notification');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get user notifications
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort('-createdAt')
    .limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  successResponse(res, 200, 'Notifications fetched', { notifications, unreadCount });
};

// @desc    Mark as read
const markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  successResponse(res, 200, 'Marked as read');
};

// @desc    Mark all as read
const markAllRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  successResponse(res, 200, 'All marked as read');
};

module.exports = { getNotifications, markAsRead, markAllRead };
