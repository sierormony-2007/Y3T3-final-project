const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { createPickup, getPickups, getPickupById, updateStatus, cancelPickup, getHistory } = require('../controllers/pickupController');

/**
 * @swagger
 * /api/pickups:
 *   post:
 *     tags: [Pickups]
 *     summary: Schedule a new e-waste pickup
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PickupRequest'
 *     responses:
 *       201:
 *         description: Pickup created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pickup'
 *       400:
 *         description: Validation error
 *   get:
 *     tags: [Pickups]
 *     summary: Get pickups (own for user, all for staff)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pickups
 */
router.post('/', auth, createPickup);
router.get('/', auth, getPickups);

/**
 * @swagger
 * /api/pickups/history:
 *   get:
 *     tags: [Pickups]
 *     summary: Get user's completed (recycled) pickups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Completed pickup history
 */
router.get('/history', auth, getHistory);

/**
 * @swagger
 * /api/pickups/{id}:
 *   get:
 *     tags: [Pickups]
 *     summary: Get a single pickup by ID
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
 *         description: Pickup details
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Pickups]
 *     summary: Cancel a pending pickup
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
 *         description: Cancelled successfully
 *       400:
 *         description: Cannot cancel non-pending pickup
 */
router.get('/:id', auth, getPickupById);
router.delete('/:id', auth, cancelPickup);

/**
 * @swagger
 * /api/pickups/{id}/status:
 *   patch:
 *     tags: [Pickups]
 *     summary: Update pickup status (staff only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, processing, recycled]
 *     responses:
 *       200:
 *         description: Updated pickup
 *       403:
 *         description: Forbidden – staff only
 */
router.patch('/:id/status', auth, role('staff'), updateStatus);

module.exports = router;
