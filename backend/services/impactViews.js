const { UserImpact, User } = require('../models');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200; // hard cap — prevents pulling the whole table + join into memory

async function getUserImpact(userId) {
  const [impact] = await UserImpact.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId },
  });
  return impact;
}

async function getAllImpact({ page = 1, limit = DEFAULT_LIMIT } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  const offset = (safePage - 1) * safeLimit;

  const { rows, count } = await UserImpact.findAndCountAll({
    include: [{ model: User, attributes: ['full_name', 'city'] }],
    order: [['co2_saved_kg', 'DESC']],
    limit: safeLimit,
    offset,
  });

  return {
    impact: rows,
    total: count,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(count / safeLimit),
  };
}

module.exports = { getUserImpact, getAllImpact };