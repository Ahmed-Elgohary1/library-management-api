const express = require('express');
const router = express.Router();
const container = require('../config/container');
const { validateBook } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const bookController = container.get('bookController');

const searchRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many search requests, please try again later'
  }
});

/**
 * Book Routes
 * Handles all book-related API endpoints
 */

/**
 * @swagger
 * /books/search:
 *   get:
 *     summary: Search books by title, author, or ISBN
 *     tags: [Books]
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
 *                         $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 */
router.get('/search', searchRateLimit, validateBook.search, (req, res) => bookController.search(req, res));

/**
 * @swagger
 * /books/low-availability:
 *   get:
 *     summary: Get books with low availability
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 2
 *         description: Availability threshold
 *     responses:
 *       200:
 *         description: Books with low availability
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
 *                         $ref: '#/components/schemas/Book'
 */
router.get('/low-availability', (req, res) => bookController.getLowAvailability(req, res));

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books with pagination and filtering
 *     tags: [Books]
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
 *         description: Search term
 *       - in: query
 *         name: available_only
 *         schema:
 *           type: boolean
 *         description: Show only available books
 *     responses:
 *       200:
 *         description: List of books
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
 *                         $ref: '#/components/schemas/Book'
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, isbn]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               author:
 *                 type: string
 *                 maxLength: 255
 *               isbn:
 *                 type: string
 *                 pattern: '^[0-9]{10}$|^[0-9]{13}$'
 *               available_quantity:
 *                 type: integer
 *                 minimum: 0
 *               total_quantity:
 *                 type: integer
 *                 minimum: 0
 *               shelf_location:
 *                 type: string
 *                 maxLength: 50
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Book with ISBN already exists
 */
router.get('/', validateBook.search, (req, res) => bookController.getAll(req, res));
router.post('/', validateBook.create, (req, res) => bookController.create(req, res));

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               author:
 *                 type: string
 *                 maxLength: 255
 *               isbn:
 *                 type: string
 *                 pattern: '^[0-9]{10}$|^[0-9]{13}$'
 *               available_quantity:
 *                 type: integer
 *                 minimum: 0
 *               total_quantity:
 *                 type: integer
 *                 minimum: 0
 *               shelf_location:
 *                 type: string
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       409:
 *         description: Cannot delete book with active borrowings
 */
/**
 * @swagger
 * /books/isbn/{isbn}:
 *   delete:
 *     summary: Delete a book by ISBN
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9]{10}$|^[0-9]{13}$'
 *         description: Book ISBN (10 or 13 digits)
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       409:
 *         description: Cannot delete book with active borrowings
 */
router.get('/:id', validateBook.id, (req, res) => bookController.getById(req, res));
router.put('/:id', validateBook.update, (req, res) => bookController.update(req, res));
router.delete('/:id', validateBook.id, (req, res) => bookController.delete(req, res));

router.delete('/isbn/:isbn([0-9]{10}|[0-9]{13})', validateBook.isbn, (req, res) => bookController.deleteByISBN(req, res));

module.exports = router; 