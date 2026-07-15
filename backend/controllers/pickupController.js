const svc = require('../services/staffWorkload');

async function createPickup(req, res, next) {
  try { res.status(201).json(await svc.createPickup(req.user.id, req.body)); } catch (err) { next(err); }
}
async function getPickups(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  const userId = req.user.id;
  const role   = req.user.role;
  try { res.json(await svc.getPickups(userId, role)); } catch (err) { next(err); }
}
async function getPickupById(req, res, next) {
  const userId = req.user ? req.user.id : undefined;
  const role   = req.user ? req.user.role : 'staff';
  try { res.json(await svc.getPickupById(req.params.id, userId, role)); } catch (err) { next(err); }
}
async function updateStatus(req, res, next) {
  try { res.json(await svc.updateStatus(req.params.id, req.body.status, req.user.role, req.user.staff_role)); } catch (err) { next(err); }
}
async function cancelPickup(req, res, next) {
  try { res.json(await svc.cancelPickup(req.params.id, req.user.id, req.user.role, req.user.staff_role)); } catch (err) { next(err); }
}
async function getHistory(req, res, next) {
  const userId = req.user ? req.user.id : undefined;
  try { res.json(await svc.getHistory(userId)); } catch (err) { next(err); }
}

module.exports = { createPickup, getPickups, getPickupById, updateStatus, cancelPickup, getHistory };