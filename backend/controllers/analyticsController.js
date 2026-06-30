const svc = require('../services/analyticsService');
const dashboard = require('../services/Dashboardservice');

async function upcomingPickups(req, res, next) {
  try { res.json(await svc.getUpcomingPickups()); } catch (err) { next(err); }
}
async function leaderboard(req, res, next) {
  try { res.json(await svc.getLeaderboard()); } catch (err) { next(err); }
}
async function categoryTotals(req, res, next) {
  try { res.json(await svc.getCategoryTotals()); } catch (err) { next(err); }
}
async function staffPerformance(req, res, next) {
  try { res.json(await svc.getStaffPerformance()); } catch (err) { next(err); }
}
async function usersWithNoPickups(req, res, next) {
  try { res.json(await svc.getUsersWithNoPickups()); } catch (err) { next(err); }
}
async function monthlyTrend(req, res, next) {
  try { res.json(await svc.getMonthlyTrend()); } catch (err) { next(err); }
}
async function cityImpact(req, res, next) {
  try { res.json(await svc.getCityImpact()); } catch (err) { next(err); }
}
async function unreadNotificationCounts(req, res, next) {
  try { res.json(await svc.getUnreadNotificationCounts()); } catch (err) { next(err); }
}
async function mostRecycledCategory(req, res, next) {
  try { res.json(await svc.getMostRecycledCategory()); } catch (err) { next(err); }
}
async function ledgerDiscrepancies(req, res, next) {
  try { res.json(await svc.getLedgerDiscrepancies()); } catch (err) { next(err); }
}
async function aboveAveragePointsUsers(req, res, next) {
  try { res.json(await svc.getAboveAveragePointsUsers()); } catch (err) { next(err); }
}

// vw_staff_workload / sp_get_user_history equivalents
async function staffWorkload(req, res, next) {
  try { res.json(await dashboard.getStaffWorkload()); } catch (err) { next(err); }
}
async function userHistory(req, res, next) {
  try { res.json(await dashboard.getUserHistory(req.params.userId)); } catch (err) { next(err); }
}

module.exports = {
  upcomingPickups,
  leaderboard,
  categoryTotals,
  staffPerformance,
  usersWithNoPickups,
  monthlyTrend,
  cityImpact,
  unreadNotificationCounts,
  mostRecycledCategory,
  ledgerDiscrepancies,
  aboveAveragePointsUsers,
  staffWorkload,
  userHistory,
};
