const { Op } = require('sequelize');
const { sequelize, Reward, RewardTransaction, User } = require('../models');

// ── Rewards ──────────────────────────────────────────────────────────────────

async function getRewards() {
  return Reward.findAll({
    where: { is_active: true },
    order: [['points_cost', 'ASC']],
  });
}

async function redeemReward(userId, rewardId) {
  if (!rewardId) throw { status: 400, message: 'rewardId is required' };

  return sequelize.transaction(async (t) => {
    const [reward, user] = await Promise.all([
      Reward.findByPk(rewardId, { transaction: t }),
      User.findByPk(userId,    { transaction: t }),
    ]);
    if (!reward || !reward.is_active) throw { status: 404, message: 'Reward not found' };
    if (!user)   throw { status: 404, message: 'User not found' };
    if (reward.stock <= 0) throw { status: 400, message: 'Reward is out of stock' };
    if (user.total_points < reward.points_cost) {
      throw { status: 400, message: 'Not enough points to redeem this reward' };
    }

    await RewardTransaction.create({
      user_id:     userId,
      type:        'redeemed',
      points:      -reward.points_cost,
      description: `Redeemed: ${reward.name}`,
    }, { transaction: t });

    reward.stock -= 1;
    await reward.save({ transaction: t });

    await user.reload({ transaction: t });
    return { reward, remaining_points: user.total_points };
  });
}

async function getRedemptionHistory(userId) {
  const where = { type: 'redeemed' };
  if (userId) where.user_id = userId;
  return RewardTransaction.findAll({
    where,
    order: [['created_at', 'DESC']],
  });
}

// ── Staff: add / update / delete rewards ─────────────────────────────────────

async function addReward(body) {
  const { name, points_cost } = body;
  if (!name || !points_cost) {
    throw { status: 400, message: 'name and points_cost are required' };
  }
  return Reward.create(body);
}

async function updateReward(id, updates) {
  const reward = await Reward.findByPk(id);
  if (!reward) throw { status: 404, message: 'Reward not found' };

  const allowed = ['name', 'description', 'points_cost', 'category', 'emoji', 'image_url', 'stock', 'is_active'];
  Object.keys(updates)
    .filter((key) => allowed.includes(key))
    .forEach((key) => { reward[key] = updates[key]; });

  await reward.save();
  return reward;
}

async function deleteReward(id) {
  const reward = await Reward.findByPk(id);
  if (!reward) throw { status: 404, message: 'Reward not found' };
  // Soft-delete: set is_active = false so redemption history stays intact
  reward.is_active = false;
  await reward.save();
  return { message: 'Reward deactivated successfully' };
}

module.exports = {
  getRewards,
  redeemReward,
  getRedemptionHistory,
  addReward,
  updateReward,
  deleteReward,
};
