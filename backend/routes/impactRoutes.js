const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { getUserImpact, getAllImpact } = require('../controllers/impactController');

/**
 * @swagger
 * /api/impact:
 *   get:
 *     tags: [Impact]
 *     summary: Get current user's environmental impact stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Impact metrics for the logged-in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalWeight: { type: number }
 *                 totalCO2Saved: { type: number }
 *                 totalEnergySaved: { type: number }
 *                 totalPoints: { type: integer }
 *                 totalPickups: { type: integer }
 *                 byCategory: { type: object }
 *                 monthlyActivity: { type: object }
 */
router.get('/', auth, getUserImpact);

/**
 * @swagger
 * /api/impact/all:
 *   get:
 *     tags: [Impact]
 *     summary: Get system-wide impact metrics (staff only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated system metrics
 *       403:
 *         description: Forbidden – staff only
 */
router.get('/all', auth, role('staff'), getAllImpact);

module.exports = router;
