const { QueryTypes, Op, fn, col, literal } = require('sequelize');
const { sequelize, User, PickupRequest, Staff, RequestDevice, DeviceCategory, UserImpact, Notification, RewardTransaction } = require('../models');

// 1) Pending/confirmed pickups awaiting or scheduled, with who and where
async function getUpcomingPickups() {
  return PickupRequest.findAll({
    where: { status: { [Op.in]: ['pending', 'confirmed'] } },
    attributes: ['request_id', 'status', 'preferred_date', 'time_window_start', 'time_window_end'],
    include: [
      { model: User, attributes: ['full_name', 'phone'] },
      { model: Staff, attributes: ['full_name'], required: false },
    ],
    order: [['preferred_date', 'ASC']],
  });
}

// 2) Leaderboard: rank users by total points (window function)
async function getLeaderboard() {
  return sequelize.query(
    `SELECT full_name, city, total_points,
            RANK() OVER (ORDER BY total_points DESC) AS rank_position
     FROM users`,
    { type: QueryTypes.SELECT }
  );
}

// 3) Total weight and points collected per device category
async function getCategoryTotals() {
  return sequelize.query(
    `SELECT dc.name,
            SUM(rd.quantity)  AS items_collected,
            SUM(rd.weight_kg) AS total_weight_kg,
            ROUND(SUM(rd.weight_kg) * dc.points_per_kg) AS points_value
     FROM request_devices rd
     JOIN device_categories dc ON dc.category_id = rd.category_id
     GROUP BY dc.category_id, dc.name, dc.points_per_kg
     ORDER BY total_weight_kg DESC`,
    { type: QueryTypes.SELECT }
  );
}

// 4) Staff performance: completed pickups + average rating, busiest first
async function getStaffPerformance() {
  return sequelize.query(
    `SELECT s.full_name, s.zone, s.rating,
            COUNT(pr.request_id) AS total_assigned,
            SUM(pr.status = 'completed') AS total_completed
     FROM staff s
     LEFT JOIN pickup_requests pr ON pr.staff_id = s.staff_id
     GROUP BY s.staff_id, s.full_name, s.zone, s.rating
     ORDER BY total_assigned DESC`,
    { type: QueryTypes.SELECT }
  );
}

// 5) Users who have never made a pickup request (LEFT JOIN anti-pattern)
async function getUsersWithNoPickups() {
  return User.findAll({
    attributes: ['user_id', 'full_name', 'email'],
    include: [{ model: PickupRequest, attributes: [], required: false }],
    where: { '$PickupRequests.request_id$': null },
  });
}

// 6) Monthly pickup volume trend
async function getMonthlyTrend() {
  return sequelize.query(
    `SELECT DATE_FORMAT(preferred_date, '%Y-%m') AS month,
            COUNT(*) AS total_requests,
            SUM(status = 'completed') AS completed_requests
     FROM pickup_requests
     GROUP BY month
     ORDER BY month`,
    { type: QueryTypes.SELECT }
  );
}

// 7) City-level environmental impact summary
async function getCityImpact() {
  return sequelize.query(
    `SELECT u.city,
            SUM(ui.total_weight_kg)    AS total_weight_kg,
            SUM(ui.co2_saved_kg)       AS total_co2_saved_kg,
            SUM(ui.toxins_diverted_kg) AS total_toxins_diverted_kg
     FROM users u
     JOIN user_impact ui ON ui.user_id = u.user_id
     GROUP BY u.city
     ORDER BY total_co2_saved_kg DESC`,
    { type: QueryTypes.SELECT }
  );
}

// 8) Unread notifications per user (for a notification badge count)
async function getUnreadNotificationCounts() {
  return Notification.findAll({
    attributes: ['user_id', [fn('COUNT', col('Notification.notification_id')), 'unread_count']],
    where: { is_read: false },
    include: [{ model: User, attributes: ['full_name'] }],
    group: ['user_id', 'User.user_id', 'User.full_name'],
  });
}

// 9) Most-recycled device category by item count
async function getMostRecycledCategory() {
  const [row] = await sequelize.query(
    `SELECT dc.name, SUM(rd.quantity) AS items_collected
     FROM request_devices rd
     JOIN device_categories dc ON dc.category_id = rd.category_id
     GROUP BY dc.category_id, dc.name
     ORDER BY items_collected DESC
     LIMIT 1`,
    { type: QueryTypes.SELECT }
  );
  return row;
}

// 10) Points ledger reconciliation — verify users.total_points matches
//     the sum of their reward_transactions (data-integrity check).
//     Should return zero rows against healthy data.
async function getLedgerDiscrepancies() {
  return sequelize.query(
    `SELECT u.user_id, u.full_name, u.total_points AS stored_total,
            COALESCE(SUM(rt.points), 0) AS computed_total,
            u.total_points - COALESCE(SUM(rt.points), 0) AS difference
     FROM users u
     LEFT JOIN reward_transactions rt ON rt.user_id = u.user_id
     GROUP BY u.user_id, u.full_name, u.total_points
     HAVING difference <> 0`,
    { type: QueryTypes.SELECT }
  );
}

// 11) Subquery: users above the average points balance
async function getAboveAveragePointsUsers() {
  return User.findAll({
    attributes: ['full_name', 'total_points'],
    where: {
      total_points: { [Op.gt]: literal('(SELECT AVG(total_points) FROM users)') },
    },
    order: [['total_points', 'DESC']],
  });
}

module.exports = {
  getUpcomingPickups,
  getLeaderboard,
  getCategoryTotals,
  getStaffPerformance,
  getUsersWithNoPickups,
  getMonthlyTrend,
  getCityImpact,
  getUnreadNotificationCounts,
  getMostRecycledCategory,
  getLedgerDiscrepancies,
  getAboveAveragePointsUsers,
};
