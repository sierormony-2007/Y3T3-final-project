const svc = require('../services/staffWorkload');

async function createPickup(req, res, next) {
  try { res.status(201).json(await svc.createPickup(req.user.id, req.body)); } catch (err) { next(err); }
}
async function getPickups(req, res, next) {
  try { res.json(await svc.getPickups(req.user.id, req.user.role)); } catch (err) { next(err); }
}
async function getPickupById(req, res, next) {
  try { res.json(await svc.getPickupById(req.params.id, req.user.id, req.user.role)); } catch (err) { next(err); }
}
async function updateStatus(req, res, next) {
  try { res.json(await svc.updateStatus(req.params.id, req.body.status, req.user.role)); } catch (err) { next(err); }
}
async function cancelPickup(req, res, next) {
  try { res.json(await svc.cancelPickup(req.params.id, req.user.id, req.user.role)); } catch (err) { next(err); }
}
async function getHistory(req, res, next) {
  try { res.json(await svc.getHistory(req.user.id)); } catch (err) { next(err); }
}

module.exports = { createPickup, getPickups, getPickupById, updateStatus, cancelPickup, getHistory };