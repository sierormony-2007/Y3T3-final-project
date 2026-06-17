const svc = require('../services/rewardService');

function getRewards(req, res, next) {
  try { res.json(svc.getRewards()); } catch (err) { next(err); }
}
function redeemReward(req, res, next) {
  try { res.status(201).json(svc.redeemReward(req.user.id, req.body.rewardId)); } catch (err) { next(err); }
}
function getRedemptionHistory(req, res, next) {
  try { res.json(svc.getRedemptionHistory(req.user.id)); } catch (err) { next(err); }
}
function addReward(req, res, next) {
  try { res.status(201).json(svc.addReward(req.body)); } catch (err) { next(err); }
}
function updateReward(req, res, next) {
  try { res.json(svc.updateReward(req.params.id, req.body)); } catch (err) { next(err); }
}
function deleteReward(req, res, next) {
  try { res.json(svc.deleteReward(req.params.id)); } catch (err) { next(err); }
}

module.exports = { getRewards, redeemReward, getRedemptionHistory, addReward, updateReward, deleteReward };
