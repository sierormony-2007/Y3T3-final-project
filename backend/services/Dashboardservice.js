const { QueryTypes } = require('sequelize');
const { sequelize, User, PickupRequest, Staff } = require('../models');

// ----------------------------------------------------------------
// Replaces vw_user_dashboard.
// One row per user combining profile + lifetime impact + pickup count.
// ----------------------------------------------------------------
async function getUserDashboard(userId) {
  const [row] = await sequelize.query(
    `SELECT
       u.user_id, u.full_name, u.city, u.total_points, u.account_status,
       COALESCE(ui.total_devices, 0)      AS total_devices,
       COALESCE(ui.total_weight_kg, 0)    AS total_weight_kg,
       COALESCE(ui.co2_saved_kg, 0)       AS co2_saved_kg,
       COALESCE(ui.toxins_diverted_kg, 0) AS toxins_diverted_kg,
       COALESCE(ui.total_pickups, 0)      AS total_pickups
     FROM users u
     LEFT JOIN user_impact ui ON ui.user_id = u.user_id
     WHERE u.user_id = :userId`,
    { replacements: { userId }, type: QueryTypes.SELECT }
  );
  return row;
}

// ----------------------------------------------------------------
// Replaces vw_staff_workload.
// Pickups handled + completion rate per staff member.
// ----------------------------------------------------------------
async function getStaffWorkload() {
  return sequelize.query(
    `SELECT
       s.staff_id, s.full_name, s.zone, s.rating, s.is_available,
       COUNT(pr.request_id) AS total_assigned,
       SUM(pr.status = 'completed') AS total_completed,
       COALESCE(ROUND(SUM(pr.status = 'completed') / NULLIF(COUNT(pr.request_id), 0), 2), 0.00) AS completion_rate
     FROM staff s
     LEFT JOIN pickup_requests pr ON pr.staff_id = s.staff_id
     GROUP BY s.staff_id, s.full_name, s.zone, s.rating, s.is_available`,
    { type: QueryTypes.SELECT }
  );
}

// ----------------------------------------------------------------
// Replaces sp_get_user_history(p_user_id).
// Full pickup history for one user, newest first, with staff name.
// ----------------------------------------------------------------
async function getUserHistory(userId) {
  return PickupRequest.findAll({
    where: { user_id: userId },
    attributes: ['request_id', 'status', 'preferred_date', 'total_devices', 'total_weight_kg', 'points_awarded'],
    include: [{ model: Staff, attributes: ['full_name'] }],
    order: [['preferred_date', 'DESC']],
  });
}

module.exports = { getUserDashboard, getStaffWorkload, getUserHistory };