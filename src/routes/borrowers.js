const express = require('express');
const router = express.Router();
const container = require('../config/container');
const { validateBorrower, validatePagination } = require('../middleware/validation');

const borrowerController = container.get('borrowerController');

/**
 * Borrower Routes
 * Handles all borrower-related API endpoints
 */

/**
 * @swagger
 * /borrowers/search:
 *   get:
 *     summary: Search borrowers by name or email
 *     tags: [Borrowers]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Search results
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
 *                         $ref: '#/components/schemas/Borrower'
 *       400:
 *         description: Invalid search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', validateBorrower.search, (req, res) => borrowerController.search(req, res));

/**
 * @swagger
 * /borrowers/overdue:
 *   get:
 *     summary: Get borrowers with overdue books
 *     tags: [Borrowers]
 *     responses:
 *       200:
 *         description: List of borrowers with overdue books
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
 *                         $ref: '#/components/schemas/Borrower'
 */
router.get('/overdue', (req, res) => borrowerController.getOverdueBorrowers(req, res));

/**
 * @swagger
 * /borrowers:
 *   get:
 *     summary: Get all borrowers with pagination and filtering
 *     tags: [Borrowers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *     responses:
 *       200:
 *         description: List of borrowers
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
 *                         $ref: '#/components/schemas/Borrower'
 *   post:
 *     summary: Create a new borrower
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 example: 'John Smith'
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'john.smith@email.com'
 *               registered_date:
 *                 type: string
 *                 format: date
 *                 example: '2024-01-15'
 *     responses:
 *       201:
 *         description: Borrower created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Borrower'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Borrower with email already exists
 */
router.get('/', validateBorrower.search, (req, res) => borrowerController.getAll(req, res));
router.post('/', validateBorrower.create, (req, res) => borrowerController.create(req, res));

/**
 * @swagger
 * /borrowers/{id}:
 *   get:
 *     summary: Get a borrower by ID
 *     tags: [Borrowers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Borrower ID
 *     responses:
 *       200:
 *         description: Borrower details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Borrower'
 *       404:
 *         description: Borrower not found
 *   put:
 *     summary: Update a borrower
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Borrower ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *               email:
 *                 type: string
 *                 format: email
 *               registered_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Borrower updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Borrower'
 *       404:
 *         description: Borrower not found
 *       409:
 *         description: Email already exists
 *   delete:
 *     summary: Delete a borrower
 *     tags: [Borrowers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Borrower ID
 *     responses:
 *       200:
 *         description: Borrower deleted successfully
 *       404:
 *         description: Borrower not found
 *       409:
 *         description: Cannot delete borrower with active borrowings
 */
router.get('/:id', validateBorrower.id, (req, res) => borrowerController.getById(req, res));
router.put('/:id', validateBorrower.update, (req, res) => borrowerController.update(req, res));
router.delete('/:id', validateBorrower.id, (req, res) => borrowerController.delete(req, res));

/**
 * @swagger
 * /borrowers/{id}/current-books:
 *   get:
 *     summary: Get borrower's current borrowed books
 *     tags: [Borrowers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Borrower ID
 *     responses:
 *       200:
 *         description: Current borrowed books
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
 *                         $ref: '#/components/schemas/Borrowing'
 *       404:
 *         description: Borrower not found
 */
router.get('/:id/current-books', validateBorrower.id, (req, res) => borrowerController.getCurrentBooks(req, res));

/**
 * @swagger
 * /borrowers/{id}/history:
 *   get:
 *     summary: Get borrower's borrowing history
 *     tags: [Borrowers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Borrower ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Borrowing history
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
 *                         $ref: '#/components/schemas/Borrowing'
 *       404:
 *         description: Borrower not found
 */
router.get('/:id/history', validateBorrower.id, validatePagination, (req, res) => borrowerController.getBorrowingHistory(req, res));

module.exports = router; 