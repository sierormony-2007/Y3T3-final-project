const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { getArticles, getArticleById, createArticle, updateArticle, deleteArticle } = require('../controllers/articleController');

/**
 * @swagger
 * /api/articles:
 *   get:
 *     tags: [Articles]
 *     summary: Get all awareness articles (public)
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *   post:
 *     tags: [Articles]
 *     summary: Create a new article (staff only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               category: { type: string }
 *     responses:
 *       201:
 *         description: Article created
 */
router.get('/', getArticles);
router.post('/', auth, role('staff'), createArticle);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     tags: [Articles]
 *     summary: Get article by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Article details
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Articles]
 *     summary: Update article (staff only)
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
 *               title: { type: string }
 *               content: { type: string }
 *               category: { type: string }
 *     responses:
 *       200:
 *         description: Updated article
 *   delete:
 *     tags: [Articles]
 *     summary: Delete article (staff only)
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
router.get('/:id', getArticleById);
router.patch('/:id', auth, role('staff'), updateArticle);
router.delete('/:id', auth, role('staff'), deleteArticle);

module.exports = router;
