const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
  getUsers, getUserById, createUser, updateUser, deleteUser,
} = require('../controllers/userController');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserInput:
 *       type: object
 *       required: [full_name, email, password]
 *       properties:
 *         full_name: { type: string, example: "Srey Leak" }
 *         email:     { type: string, format: email, example: "sreyleak@gmail.com" }
 *         password:  { type: string, example: "mypassword123" }
 *         phone:     { type: string, example: "012345678" }
 *         address:   { type: string, example: "House 12, St. 105, Daun Penh" }
 *         city:      { type: string, example: "Phnom Penh" }
 *         role:      { type: string, enum: [user, staff], example: "user" }
 *     UserUpdate:
 *       type: object
 *       properties:
 *         full_name:      { type: string }
 *         email:          { type: string, format: email }
 *         password:       { type: string, description: "New password (will be re-hashed)" }
 *         phone:          { type: string }
 *         address:        { type: string }
 *         city:           { type: string }
 *         account_status: { type: string, enum: [active, inactive, banned] }
 *         role:           { type: string, enum: [user, staff] }
 *         total_points:   { type: integer }
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (public)
 *     responses:
 *       200:
 *         description: List of all users
 *   post:
 *     tags: [Users]
 *     summary: Create a new user (staff only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.get('/', getUsers);
router.post('/', auth, role('staff'), createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a single user by ID (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The user
 *       404:
 *         description: User not found
 *   put:
 *     tags: [Users]
 *     summary: Update a user by ID (staff only)
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
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Updated user
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already registered
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user by ID (staff only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.get('/:id', getUserById);
router.put('/:id', auth, role('staff'), updateUser);
router.delete('/:id', auth, role('staff'), deleteUser);

module.exports = router;
