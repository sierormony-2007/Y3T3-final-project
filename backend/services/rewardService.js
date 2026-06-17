const db = require('../config/db');

function getRewards() {
  return db.get('rewards').value();
}

function redeemReward(userId, rewardId) {
  if (!rewardId) throw { status: 400, message: 'rewardId is required' };
  const reward = db.get('rewards').find({ id: parseInt(rewardId) }).value();
  if (!reward) throw { status: 404, message: 'Reward not found' };
  if (reward.stock <= 0) throw { status: 400, message: 'This reward is out of stock' };

  const user = db.get('users').find({ id: userId }).value();
  if (!user) throw { status: 404, message: 'User not found' };
  if (user.points < reward.pts) throw { status: 400, message: 'Not enough points to redeem this reward' };

  db.get('users').find({ id: userId }).assign({ points: user.points - reward.pts }).write();
  db.get('rewards').find({ id: parseInt(rewardId) }).assign({ stock: reward.stock - 1 }).write();

  const redemptions = db.get('redemptions').value();
  const newId = redemptions.length > 0 ? Math.max(...redemptions.map(r => r.id)) + 1 : 1;
  const redemption = { id: newId, userId, rewardId: reward.id, rewardName: reward.name, pointsSpent: reward.pts, redeemedAt: new Date().toISOString() };
  db.get('redemptions').push(redemption).write();
  console.log(`🎁 REDEEM: user #${userId} "${reward.name}" -${reward.pts}pts`);

  const { password, ...safeUser } = db.get('users').find({ id: userId }).value();
  return { redemption, user: safeUser };
}

function getRedemptionHistory(userId) {
  return db.get('redemptions').filter({ userId }).value();
}

function addReward({ name, desc, pts, cat, emoji, stock }) {
  if (!name || !pts || !cat) throw { status: 400, message: 'name, pts, and cat are required' };
  const rewards = db.get('rewards').value();
  const newId = rewards.length > 0 ? Math.max(...rewards.map(r => r.id)) + 1 : 1;
  const newReward = { id: newId, name, desc: desc || '', pts, cat, emoji: emoji || '🎁', stock: stock || 0 };
  db.get('rewards').push(newReward).write();
  return newReward;
}

function updateReward(id, body) {
  const reward = db.get('rewards').find({ id: parseInt(id) }).value();
  if (!reward) throw { status: 404, message: 'Reward not found' };
  const update = {};
  ['name','desc','pts','cat','emoji','stock'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
  db.get('rewards').find({ id: parseInt(id) }).assign(update).write();
  return db.get('rewards').find({ id: parseInt(id) }).value();
}

function deleteReward(id) {
  const reward = db.get('rewards').find({ id: parseInt(id) }).value();
  if (!reward) throw { status: 404, message: 'Reward not found' };
  db.get('rewards').remove({ id: parseInt(id) }).write();
  return { message: 'Reward deleted' };
}

module.exports = { getRewards, redeemReward, getRedemptionHistory, addReward, updateReward, deleteReward };
