const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const role    = require('../middleware/roleMiddleware');
const {
  createPickup, getPickups, getPickupById,
  updateStatus, cancelPickup, getHistory,
} = require('../controllers/pickupController');

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceInput:
 *       type: object
 *       required: [category_id]
 *       properties:
 *         category_id: { type: integer, example: 1 }
 *         quantity:    { type: integer, example: 2 }
 *         weight_kg:   { type: number,  example: 1.5 }
 *         condition_:  { type: string,  enum: [working, broken, unknown], example: broken }
 *         notes:       { type: string,  example: "Screen cracked" }
 *
 *     PickupRequest:
 *       type: object
 *       required: [pickup_address, preferred_date, time_window_start, time_window_end, devices]
 *       properties:
 *         pickup_address:    { type: string,  example: "House 12, St. 105, Phnom Penh" }
 *         preferred_date:    { type: string,  format: date,  example: "2026-07-15" }
 *         time_window_start: { type: string,  example: "09:00:00" }
 *         time_window_end:   { type: string,  example: "11:00:00" }
 *         pickup_latitude:   { type: number,  example: 11.5625 }
 *         pickup_longitude:  { type: number,  example: 104.9160 }
 *         special_note:      { type: string,  example: "Leave at gate if not home" }
 *         phone:             { type: string,  example: "012345678", description: "Contact phone for this pickup" }
 *         link:              { type: string,  example: "https://maps.google.com/?q=11.5625,104.9160", description: "Google Maps or reference link" }
 *         devices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DeviceInput'
 */

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
 *           example:
 *             pickup_address: "House 12, St. 105, Daun Penh, Phnom Penh"
 *             preferred_date: "2026-07-15"
 *             time_window_start: "09:00:00"
 *             time_window_end: "11:00:00"
 *             phone: "012345678"
 *             link: "https://maps.google.com/?q=11.5625,104.9160"
 *             special_note: "Leave at gate if not home"
 *             devices:
 *               - category_id: 1
 *                 quantity: 1
 *                 weight_kg: 0.2
 *                 condition_: "broken"
 *                 notes: "Cracked screen"
 *               - category_id: 2
 *                 quantity: 1
 *                 weight_kg: 1.6
 *                 condition_: "broken"
 *                 notes: "Battery dead"
 *     responses:
 *       201:
 *         description: Pickup created
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
router.get('/',  getPickups);

/**
 * @swagger
 * /api/pickups/history:
 *   get:
 *     tags: [Pickups]
 *     summary: Get user's completed or cancelled pickups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pickup history
 */
router.get('/history', getHistory);

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
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pickup details including phone and link fields
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Pickups]
 *     summary: Cancel a pickup
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cancelled
 *       400:
 *         description: Cannot cancel completed or already-cancelled pickup
 */
router.get('/:id',    getPickupById);
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
 *         schema: { type: integer }
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
 *                 enum: [pending, confirmed, in_transit, completed, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Updated pickup
 *       403:
 *         description: Forbidden – staff only
 */
router.patch('/:id/status', auth, role('staff'), updateStatus);

module.exports = router;
