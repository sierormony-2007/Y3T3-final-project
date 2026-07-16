const svc = require('../services/userHistory');

async function getRewards(req, res, next) {
  try { res.json(await svc.getRewards()); } catch (err) { next(err); }
}
async function redeemReward(req, res, next) {
  try { res.json(await svc.redeemReward(req.user.id, req.body.rewardId, req.body.quantity)); } catch (err) { next(err); }
}
async function getRedemptionHistory(req, res, next) {
  const userId = req.user ? req.user.id : undefined;
  try { res.json(await svc.getRedemptionHistory(userId)); } catch (err) { next(err); }
}
// Staff only
async function addReward(req, res, next) {
  try { res.status(201).json(await svc.addReward(req.body)); } catch (err) { next(err); }
}
async function updateReward(req, res, next) {
  try { res.json(await svc.updateReward(req.params.id, req.body)); } catch (err) { next(err); }
}
async function deleteReward(req, res, next) {
  try { res.json(await svc.deleteReward(req.params.id)); } catch (err) { next(err); }
}

module.exports = { getRewards, redeemReward, getRedemptionHistory, addReward, updateReward, deleteReward };
