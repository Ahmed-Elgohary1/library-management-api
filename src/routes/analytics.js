const express = require('express');
const router = express.Router();
const container = require('../config/container');
const { validateAnalytics } = require('../middleware/validation');
const { authenticateToken, requireLibrarian } = require('../middleware/auth');

const analyticsController = container.get('analyticsController');

/**
 * Analytics Routes
 * Handles analytics and reporting endpoints
 * Requires authentication for access
 */

router.use(authenticateToken);
router.use(requireLibrarian);

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get analytics summary dashboard
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total_books:
 *                           type: integer
 *                           description: Total number of books in library
 *                         total_borrowers:
 *                           type: integer
 *                           description: Total number of registered borrowers
 *                         active_borrowings:
 *                           type: integer
 *                           description: Current active borrowings
 *                         overdue_borrowings:
 *                           type: integer
 *                           description: Current overdue borrowings
 *                         most_borrowed_books:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                               author:
 *                                 type: string
 *                               borrow_count:
 *                                 type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/summary', (req, res) => analyticsController.getSummary(req, res));

/**
 * @swagger
 * /analytics/export:
 *   get:
 *     summary: Export analytics data in CSV or XLSX format
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *         description: Export format
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [overdue, borrowings, popular_books]
 *         description: Type of data to export
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           pattern: '^[0-9]{4}-[0-9]{2}$'
 *           example: '2024-01'
 *         description: Month filter (YYYY-MM format)
 *     responses:
 *       200:
 *         description: Export file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid export parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/export', validateAnalytics.export, (req, res) => analyticsController.exportData(req, res));

/**
 * @swagger
 * /analytics/popular-books:
 *   get:
 *     summary: Get popular books analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of popular books to return
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year, all]
 *           default: month
 *         description: Time period for popularity calculation
 *     responses:
 *       200:
 *         description: Popular books data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           book_id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           author:
 *                             type: string
 *                           isbn:
 *                             type: string
 *                           borrow_count:
 *                             type: integer
 *                           rank:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/popular-books', (req, res) => analyticsController.getPopularBooks(req, res));

module.exports = router; 