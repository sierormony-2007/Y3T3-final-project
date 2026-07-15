const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const role    = require('../middleware/roleMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const {
  getRewards, redeemReward, getRedemptionHistory,
  addReward, updateReward, deleteReward,
} = require('../controllers/rewardController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reward:
 *       type: object
 *       properties:
 *         reward_id:   { type: integer }
 *         name:        { type: string }
 *         description: { type: string }
 *         points_cost: { type: integer }
 *         category:    { type: string }
 *         emoji:       { type: string }
 *         stock:       { type: integer }
 *         is_active:   { type: boolean }
 *
 *     RewardInput:
 *       type: object
 *       required: [name, points_cost]
 *       properties:
 *         name:        { type: string,  example: "Bamboo Water Bottle" }
 *         description: { type: string,  example: "BPA-free reusable bottle" }
 *         points_cost: { type: integer, example: 200 }
 *         category:    { type: string,  example: "Lifestyle" }
 *         emoji:       { type: string,  example: "🧴" }
 *         stock:       { type: integer, example: 50 }
 */

/**
 * @swagger
 * /api/rewards:
 *   get:
 *     tags: [Rewards]
 *     summary: Get all active rewards
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
 *     summary: Add a new reward — ADMIN STAFF ONLY
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardInput'
 *           example:
 *             name: "Bamboo Water Bottle"
 *             description: "BPA-free reusable bottle"
 *             points_cost: 200
 *             category: "Lifestyle"
 *             emoji: "🧴"
 *             stock: 50
 *     responses:
 *       201:
 *         description: Reward created
 *       403:
 *         description: Forbidden – admin staff only
 */
router.get('/',  getRewards);
router.post('/', auth, role('staff'), addReward);

/**
 * @swagger
 * /api/rewards/redeem:
 *   post:
 *     tags: [Rewards]
 *     summary: Redeem a reward using points (user)
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
 *                 example: 1
 *     responses:
 *       200:
 *         description: Redeemed successfully
 *       400:
 *         description: Not enough points or out of stock
 */
router.post('/redeem', auth, redeemReward);

/**
 * @swagger
 * /api/rewards/history:
 *   get:
 *     tags: [Rewards]
 *     summary: Get current user's redemption history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of redemption transactions
 */
router.get('/history', getRedemptionHistory);

/**
 * @swagger
 * /api/rewards/{id}:
 *   patch:
 *     tags: [Rewards]
 *     summary: Update a reward — STAFF ONLY
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *               points_cost: { type: integer }
 *               stock:       { type: integer }
 *               is_active:   { type: boolean }
 *           example:
 *             stock: 100
 *             points_cost: 150
 *     responses:
 *       200:
 *         description: Updated reward
 *       403:
 *         description: Forbidden – staff only
 *       404:
 *         description: Reward not found
 *   delete:
 *     tags: [Rewards]
 *     summary: Deactivate a reward — ADMIN STAFF ONLY
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Reward deactivated
 *       403:
 *         description: Forbidden – admin staff only
 *       404:
 *         description: Reward not found
 */
router.patch('/:id',  auth, role('staff'), updateReward);
router.delete('/:id', auth, role('staff'), deleteReward);

module.exports = router;
