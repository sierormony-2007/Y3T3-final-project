const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/analyticsController');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Reporting/analytics queries (staff only) — converted from PART 4 of the SQL script
 */

router.get('/upcoming-pickups', auth, role('staff'), ctrl.upcomingPickups);
router.get('/leaderboard', auth, ctrl.leaderboard); // anyone can see the points leaderboard
router.get('/category-totals', auth, role('staff'), ctrl.categoryTotals);
router.get('/staff-performance', auth, role('staff'), ctrl.staffPerformance);
router.get('/staff-workload', auth, role('staff'), ctrl.staffWorkload);
router.get('/users-no-pickups', auth, role('staff'), ctrl.usersWithNoPickups);
router.get('/monthly-trend', auth, role('staff'), ctrl.monthlyTrend);
router.get('/city-impact', auth, role('staff'), ctrl.cityImpact);
router.get('/unread-notifications', auth, role('staff'), ctrl.unreadNotificationCounts);
router.get('/most-recycled-category', auth, role('staff'), ctrl.mostRecycledCategory);
router.get('/ledger-discrepancies', auth, role('staff'), ctrl.ledgerDiscrepancies);
router.get('/above-average-points', auth, role('staff'), ctrl.aboveAveragePointsUsers);
router.get('/user-history/:userId', auth, ctrl.userHistory);

module.exports = router;
