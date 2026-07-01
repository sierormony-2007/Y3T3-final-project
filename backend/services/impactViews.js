const { UserImpact, User } = require('../models');

async function getUserImpact(userId) {
  const [impact] = await UserImpact.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId },
  });
  return impact;
}

async function getAllImpact() {
  return UserImpact.findAll({
    include: [{ model: User, attributes: ['full_name', 'city'] }],
    order: [['co2_saved_kg', 'DESC']],
  });
}

module.exports = { getUserImpact, getAllImpact };
