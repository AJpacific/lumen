const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getUserSubscriptionHistory,
  getUserUsageHistory,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAccount,
  getUserStats
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { userOnly, adminOrUser } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication and user role
router.get('/profile', authMiddleware, userOnly, getUserProfile);
router.put('/profile', authMiddleware, userOnly, updateUserProfile);
router.get('/subscription-history', authMiddleware, userOnly, getUserSubscriptionHistory);
router.get('/usage-history', authMiddleware, userOnly, getUserUsageHistory);
router.get('/notifications', authMiddleware, adminOrUser, getUserNotifications);
router.patch('/notifications/:notificationId/read', authMiddleware, adminOrUser, markNotificationAsRead);
router.patch('/notifications/read-all', authMiddleware, adminOrUser, markAllNotificationsAsRead);
router.delete('/account', authMiddleware, userOnly, deleteAccount);
router.get('/stats', authMiddleware, userOnly, getUserStats);

module.exports = router;
