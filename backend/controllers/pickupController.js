const svc = require('../services/pickupService');

function createPickup(req, res, next) {
  try { res.status(201).json(svc.createPickup(req.user.id, req.body)); } catch (err) { next(err); }
}
function getPickups(req, res, next) {
  try { res.json(svc.getPickups(req.user.id, req.user.role)); } catch (err) { next(err); }
}
function getPickupById(req, res, next) {
  try { res.json(svc.getPickupById(req.params.id, req.user.id, req.user.role)); } catch (err) { next(err); }
}
function updateStatus(req, res, next) {
  try { res.json(svc.updateStatus(req.params.id, req.body.status, req.user.role)); } catch (err) { next(err); }
}
function cancelPickup(req, res, next) {
  try { res.json(svc.cancelPickup(req.params.id, req.user.id, req.user.role)); } catch (err) { next(err); }
}
function getHistory(req, res, next) {
  try { res.json(svc.getHistory(req.user.id)); } catch (err) { next(err); }
}

module.exports = { createPickup, getPickups, getPickupById, updateStatus, cancelPickup, getHistory };
