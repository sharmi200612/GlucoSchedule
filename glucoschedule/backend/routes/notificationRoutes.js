const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createNotification, getNotifications,
  markAsRead, markAllRead,
  deleteNotification, deleteAllNotifications,
  sendDailyReminders, scheduleDailyPlannerEmails,
  runScheduledEmails, testEmail,
} = require('../controllers/notificationController');

router.get ('/',                         protect, getNotifications);
router.post('/create',                   protect, createNotification);
router.put ('/read-all',                 protect, markAllRead);
router.post('/send-daily-reminders',     protect, sendDailyReminders);
router.post('/schedule-daily-planner',   protect, scheduleDailyPlannerEmails);
router.post('/test-email',               protect, testEmail);
router.put ('/:id/read',                 protect, markAsRead);
router.delete('/all',                    protect, deleteAllNotifications);
router.delete('/:id',                    protect, deleteNotification);

module.exports = router;
