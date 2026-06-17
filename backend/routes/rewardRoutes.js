const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { getRewards, redeemReward, getRedemptionHistory, addReward, updateReward, deleteReward } = require('../controllers/rewardController');

/**
 * @swagger
 * /api/rewards:
 *   get:
 *     tags: [Rewards]
 *     summary: Get all available rewards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reward'
 *   post:
 *     tags: [Rewards]
 *     summary: Add a new reward (staff only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, pts, cat]
 *             properties:
 *               name: { type: string }
 *               desc: { type: string }
 *               pts: { type: integer }
 *               cat: { type: string }
 *               emoji: { type: string }
 *               stock: { type: integer }
 *     responses:
 *       201:
 *         description: Reward created
 */
router.get('/', auth, getRewards);
router.post('/', auth, role('staff'), addReward);

/**
 * @swagger
 * /api/rewards/redeem:
 *   post:
 *     tags: [Rewards]
 *     summary: Redeem a reward with points
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rewardId]
 *             properties:
 *               rewardId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Reward redeemed successfully
 *       400:
 *         description: Not enough points or out of stock
 */
router.post('/redeem', auth, redeemReward);

/**
 * @swagger
 * /api/rewards/history:
 *   get:
 *     tags: [Rewards]
 *     summary: Get user's redemption history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Redemption history
 */
router.get('/history', auth, getRedemptionHistory);

/**
 * @swagger
 * /api/rewards/{id}:
 *   patch:
 *     tags: [Rewards]
 *     summary: Update a reward (staff only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               pts: { type: integer }
 *               stock: { type: integer }
 *     responses:
 *       200:
 *         description: Updated reward
 *   delete:
 *     tags: [Rewards]
 *     summary: Delete a reward (staff only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.patch('/:id', auth, role('staff'), updateReward);
router.delete('/:id', auth, role('staff'), deleteReward);

module.exports = router;
