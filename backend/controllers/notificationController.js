const svc = require('../services/notificationService');

async function getMyNotifications(req, res, next) {
  try { res.json(await svc.getMyNotifications(req.user.id)); } catch (err) { next(err); }
}
async function getUnreadCount(req, res, next) {
  try { res.json({ unread_count: await svc.getUnreadCount(req.user.id) }); } catch (err) { next(err); }
}
async function markRead(req, res, next) {
  try { res.json(await svc.markRead(req.user.id, req.params.id)); } catch (err) { next(err); }
}
async function markAllRead(req, res, next) {
  try { res.json(await svc.markAllRead(req.user.id)); } catch (err) { next(err); }
}

module.exports = { getMyNotifications, getUnreadCount, markRead, markAllRead };
