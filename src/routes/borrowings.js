const express = require('express');
const router = express.Router();
const container = require('../config/container');
const { validateBorrowing } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const borrowingController = container.get('borrowingController');

const checkoutRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many checkout requests, please try again later'
  }
});

/**
 * Borrowing Routes
 * Handles all borrowing-related API endpoints
 */

/**
 * @swagger
 * /borrowings/checkout:
 *   post:
 *     summary: Check out a book to a borrower
 *     tags: [Borrowings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [book_id, borrower_id, due_date]
 *             properties:
 *               book_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               borrower_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: '2024-02-15'
 *     responses:
 *       201:
 *         description: Book checked out successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Borrowing'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Book or borrower not found
 *       409:
 *         description: Book not available for checkout
 *       429:
 *         description: Too many checkout requests
 */
router.post('/checkout', checkoutRateLimit, validateBorrowing.checkout, (req, res) => borrowingController.checkout(req, res));

/**
 * @swagger
 * /borrowings/return:
 *   post:
 *     summary: Return a borrowed book
 *     tags: [Borrowings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [borrowing_id]
 *             properties:
 *               borrowing_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               return_date:
 *                 type: string
 *                 format: date
 *                 example: '2024-02-10'
 *                 description: Optional return date (defaults to current date)
 *     responses:
 *       200:
 *         description: Book returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Borrowing'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Borrowing not found
 *       409:
 *         description: Book already returned
 */
router.post('/return', validateBorrowing.return, (req, res) => borrowingController.returnBook(req, res));

/**
 * @swagger
 * /borrowings/overdue:
 *   get:
 *     summary: Get all overdue borrowings
 *     tags: [Borrowings]
 *     responses:
 *       200:
 *         description: List of overdue borrowings
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
 */
router.get('/overdue', (req, res) => borrowingController.getOverdue(req, res));

/**
 * @swagger
 * /borrowings/borrower/{borrowerId}:
 *   get:
 *     summary: Get all borrowings by a specific borrower
 *     tags: [Borrowings]
 *     parameters:
 *       - in: path
 *         name: borrowerId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Borrower ID
 *     responses:
 *       200:
 *         description: Borrowings by borrower
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
router.get('/borrower/:borrowerId', validateBorrowing.borrowerId, (req, res) => borrowingController.getByBorrower(req, res));

/**
 * @swagger
 * /borrowings/book/{bookId}:
 *   get:
 *     summary: Get all borrowings for a specific book
 *     tags: [Borrowings]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Borrowings for book
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
 *         description: Book not found
 */
router.get('/book/:bookId', validateBorrowing.bookId, (req, res) => borrowingController.getByBook(req, res));

/**
 * @swagger
 * /borrowings:
 *   get:
 *     summary: Get all borrowings with filtering and pagination
 *     tags: [Borrowings]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned, overdue]
 *         description: Filter by borrowing status
 *       - in: query
 *         name: book_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by book ID
 *       - in: query
 *         name: borrower_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by borrower ID
 *     responses:
 *       200:
 *         description: List of borrowings
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
 */
router.get('/', validateBorrowing.list, (req, res) => borrowingController.getAll(req, res));

/**
 * @swagger
 * /borrowings/{id}:
 *   get:
 *     summary: Get a borrowing by ID
 *     tags: [Borrowings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Borrowing ID
 *     responses:
 *       200:
 *         description: Borrowing details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Borrowing'
 *       404:
 *         description: Borrowing not found
 */
router.get('/:id', validateBorrowing.id, (req, res) => borrowingController.getById(req, res));

/**
 * @swagger
 * /borrowings/{id}/extend:
 *   put:
 *     summary: Extend due date for a borrowing
 *     tags: [Borrowings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Borrowing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [new_due_date]
 *             properties:
 *               new_due_date:
 *                 type: string
 *                 format: date
 *                 example: '2024-03-01'
 *               reason:
 *                 type: string
 *                 maxLength: 255
 *                 example: 'Student requested extension'
 *     responses:
 *       200:
 *         description: Due date extended successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Borrowing'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Borrowing not found
 *       409:
 *         description: Cannot extend due date for returned book
 */
router.put('/:id/extend', validateBorrowing.extend, (req, res) => borrowingController.extendDueDate(req, res));

module.exports = router; 