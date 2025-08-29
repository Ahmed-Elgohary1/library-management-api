const { body, param, query, validationResult } = require('express-validator');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};


const validateBook = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    body('author')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Author must be between 1 and 255 characters'),
    body('isbn')
      .trim()
      .matches(/^(?:\d{10}|\d{13})$/)
      .withMessage('ISBN must be 10 or 13 digits'),
    body('available_quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Available quantity must be a non-negative integer'),
    body('total_quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Total quantity must be a non-negative integer'),
    body('shelf_location')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Shelf location must not exceed 50 characters'),
    handleValidationErrors
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid book ID - must be a positive integer'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    body('author')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Author must be between 1 and 255 characters'),
    body('isbn')
      .optional()
      .trim()
      .matches(/^(?:\d{10}|\d{13})$/)
      .withMessage('ISBN must be 10 or 13 digits'),
    body('available_quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Available quantity must be a non-negative integer'),
    body('total_quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Total quantity must be a non-negative integer'),
    body('shelf_location')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Shelf location must not exceed 50 characters'),
    handleValidationErrors
  ],
  
  id: [
    param('id').isInt({ min: 1 }).withMessage('Invalid book ID - must be a positive integer'),
    handleValidationErrors
  ],
  
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  
  isbn: [
    param('isbn')
      .trim()
      .matches(/^(?:\d{10}|\d{13})$/)
      .withMessage('ISBN must be 10 or 13 digits'),
    handleValidationErrors
  ]
};


const validateBorrower = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('registered_date')
      .optional()
      .isDate()
      .withMessage('Registered date must be a valid date'),
    handleValidationErrors
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid borrower ID - must be a positive integer'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('registered_date')
      .optional()
      .isDate()
      .withMessage('Registered date must be a valid date'),
    handleValidationErrors
  ],
  
  id: [
    param('id').isInt({ min: 1 }).withMessage('Invalid borrower ID - must be a positive integer'),
    handleValidationErrors
  ],
  
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ]
};


const validateBorrowing = {
  checkout: [
    body('book_id')
      .isInt({ min: 1 })
      .withMessage('Invalid book ID - must be a positive integer'),
    body('borrower_id')
      .isInt({ min: 1 })
      .withMessage('Invalid borrower ID - must be a positive integer'),
    body('due_date')
      .optional()
      .isDate()
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Due date must be in the future');
        }
        return true;
      })
      .withMessage('Due date must be a valid future date'),
    handleValidationErrors
  ],
  
  return: [
    body('borrowing_id')
      .isInt({ min: 1 })
      .withMessage('Invalid borrowing ID - must be a positive integer'),
    body('return_date')
      .optional()
      .isDate()
      .withMessage('Return date must be a valid date'),
    handleValidationErrors
  ],
  
  id: [
    param('id').isInt({ min: 1 }).withMessage('Invalid borrowing ID - must be a positive integer'),
    handleValidationErrors
  ],
  
  list: [
    query('status')
      .optional()
      .isIn(['all', 'active', 'returned'])
      .withMessage('Status must be one of: all, active, returned'),
    query('overdue_only')
      .optional()
      .isBoolean()
      .withMessage('Overdue only must be a boolean value'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  
  extend: [
    param('id').isInt({ min: 1 }).withMessage('Invalid borrowing ID - must be a positive integer'),
    body('days')
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage('Days must be between 1 and 30'),
    handleValidationErrors
  ],
  
  borrowerId: [
    param('borrowerId').isInt({ min: 1 }).withMessage('Invalid borrower ID - must be a positive integer'),
    handleValidationErrors
  ],
  
  bookId: [
    param('bookId').isInt({ min: 1 }).withMessage('Invalid book ID - must be a positive integer'),
    handleValidationErrors
  ]
};


const validateUser = {
  login: [
    body('username')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Username must be between 1 and 50 characters'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
  ],
  
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 6 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 6 characters with at least one lowercase letter, one uppercase letter, and one number'),
    body('role')
      .optional()
      .isIn(['admin', 'librarian'])
      .withMessage('Role must be either admin or librarian'),
    handleValidationErrors
  ]
};


const validateAnalytics = {
  export: [
    query('type')
      .isIn(['overdue', 'borrowings'])
      .withMessage('Type must be either overdue or borrowings'),
    query('format')
      .optional()
      .isIn(['csv', 'xlsx'])
      .withMessage('Format must be either csv or xlsx'),
    query('start_date')
      .optional()
      .isDate()
      .withMessage('Start date must be a valid date'),
    query('end_date')
      .optional()
      .isDate()
      .custom((value, { req }) => {
        if (req.query.start_date && new Date(value) <= new Date(req.query.start_date)) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
      .withMessage('End date must be a valid date after start date'),
    handleValidationErrors
  ]
};


const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateBook,
  validateBorrower,
  validateBorrowing,
  validateUser,
  validateAnalytics,
  validatePagination,
  handleValidationErrors
}; 