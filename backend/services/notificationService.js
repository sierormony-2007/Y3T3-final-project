const { Notification } = require('../models');

async function getMyNotifications(userId) {
  return Notification.findAll({
    where: { user_id: userId },
    order: [['sent_at', 'DESC']],
    limit: 50,
  });
}

async function getUnreadCount(userId) {
  return Notification.count({ where: { user_id: userId, is_read: false } });
}

async function markRead(userId, notificationId) {
  const notif = await Notification.findOne({
    where: { notification_id: notificationId, user_id: userId },
  });
  if (!notif) throw { status: 404, message: 'Notification not found' };
  notif.is_read = true;
  await notif.save();
  return notif;
}

async function markAllRead(userId) {
  await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } }
  );
  return { message: 'All notifications marked as read' };
}

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
};
