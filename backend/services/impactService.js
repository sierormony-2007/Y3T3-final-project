const db = require('../config/db');
const { calculateCO2, calculateEnergy } = require('../utils/calculatePoints');

function getUserImpact(userId) {
  const recycled = db.get('recyclingRecords').filter({ userId }).value();
  const user = db.get('users').find({ id: userId }).value();
  const totalWeight = recycled.reduce((sum, r) => sum + r.weight, 0);
  const byCategory = {};
  const monthlyActivity = {};
  recycled.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + r.weight;
    const month = r.completedAt ? r.completedAt.slice(0, 7) : 'unknown';
    monthlyActivity[month] = (monthlyActivity[month] || 0) + r.weight;
  });
  return {
    totalWeight: Math.round(totalWeight * 10) / 10,
    totalCO2Saved: calculateCO2(totalWeight),
    totalEnergySaved: calculateEnergy(totalWeight),
    totalPoints: user ? user.points : 0,
    totalPickups: recycled.length,
    byCategory, monthlyActivity,
  };
}

function getAllImpact() {
  const records = db.get('recyclingRecords').value();
  const totalWeight = records.reduce((sum, r) => sum + r.weight, 0);
  const pickups = db.get('pickups').value();
  return {
    totalWeight: Math.round(totalWeight * 10) / 10,
    totalCO2Saved: calculateCO2(totalWeight),
    totalEnergySaved: calculateEnergy(totalWeight),
    totalUsers: db.get('users').value().length,
    totalPickups: pickups.length,
    completedPickups: pickups.filter(p => p.status === 'recycled').length,
  };
}

module.exports = { getUserImpact, getAllImpact };
