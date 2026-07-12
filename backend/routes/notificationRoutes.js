const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const {
  getMyNotifications, getUnreadCount, markRead, markAllRead,
} = require('../controllers/notificationController');

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get the current user's notifications (most recent first)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', auth, getMyNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get the count of unread notifications for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread-count', auth, getUnreadCount);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all of the current user's notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/read-all', auth, markAllRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a single notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notification updated
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', auth, markRead);

module.exports = router;
