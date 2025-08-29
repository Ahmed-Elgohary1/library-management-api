const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');



const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management System API',
      version: '1.0.0',
      description: 'A comprehensive RESTful API for managing library operations',
      contact: {
        name: 'Library Management Team',
        email: 'support@library-api.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.library-management.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author', 'isbn'],
          properties: {
            id: {
              type: 'integer',
              minimum: 1,
              description: 'Unique identifier for the book (auto-incrementing)',
              example: 1
            },
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Book title',
              example: 'The Great Gatsby'
            },
            author: {
              type: 'string',
              maxLength: 255,
              description: 'Book author',
              example: 'F. Scott Fitzgerald'
            },
            isbn: {
              type: 'string',
              pattern: '^[0-9]{10}$|^[0-9]{13}$',
              description: 'ISBN (10 or 13 digits)',
              example: '9780743273565'
            },
            available_quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Number of available copies',
              example: 5
            },
            total_quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of copies',
              example: 5
            },
            shelf_location: {
              type: 'string',
              maxLength: 50,
              description: 'Physical location in library',
              example: 'A1-001'
            },
            borrowed_count: {
              type: 'integer',
              description: 'Number of currently borrowed copies'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Borrower: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'integer',
              minimum: 1,
              description: 'Unique identifier for the borrower (auto-incrementing)',
              example: 1
            },
            name: {
              type: 'string',
              maxLength: 255,
              description: 'Borrower full name',
              example: 'John Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Borrower email address',
              example: 'john.smith@email.com'
            },
            registered_date: {
              type: 'string',
              format: 'date',
              description: 'Registration date',
              example: '2024-01-15'
            },
            active_borrowings: {
              type: 'integer',
              description: 'Number of currently borrowed books'
            },
            total_borrowings: {
              type: 'integer',
              description: 'Total number of books ever borrowed'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Borrowing: {
          type: 'object',
          required: ['book_id', 'borrower_id', 'due_date'],
          properties: {
            id: {
              type: 'integer',
              minimum: 1,
              description: 'Unique identifier for the borrowing (auto-incrementing)',
              example: 1
            },
            book_id: {
              type: 'integer',
              minimum: 1,
              description: 'ID of the borrowed book',
              example: 1
            },
            borrower_id: {
              type: 'integer',
              minimum: 1,
              description: 'ID of the borrower',
              example: 1
            },
            checkout_date: {
              type: 'string',
              format: 'date',
              description: 'Date when book was checked out'
            },
            due_date: {
              type: 'string',
              format: 'date',
              description: 'Date when book should be returned'
            },
            return_date: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Date when book was actually returned'
            },
            is_returned: {
              type: 'boolean',
              description: 'Whether the book has been returned'
            },
            is_overdue: {
              type: 'boolean',
              description: 'Whether the book is currently overdue'
            },
            days_overdue: {
              type: 'integer',
              description: 'Number of days overdue'
            },
            title: {
              type: 'string',
              description: 'Book title'
            },
            author: {
              type: 'string',
              description: 'Book author'
            },
            borrower_name: {
              type: 'string',
              description: 'Borrower name'
            },
            borrower_email: {
              type: 'string',
              description: 'Borrower email'
            }
          }
        },
        User: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            id: {
              type: 'integer',
              minimum: 1,
              description: 'Unique identifier for the user (auto-incrementing)',
              example: 1
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              description: 'Username for login',
              example: 'admin'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Password for login',
              example: 'admin123'
            },
            role: {
              type: 'string',
              enum: ['admin', 'librarian'],
              description: 'User role',
              example: 'librarian'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the request was successful'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            pagination: {
              type: 'object',
              properties: {
                current_page: { type: 'integer' },
                total_pages: { type: 'integer' },
                total_items: { type: 'integer' },
                items_per_page: { type: 'integer' },
                has_next: { type: 'boolean' },
                has_previous: { type: 'boolean' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Books',
        description: 'Book management operations'
      },
      {
        name: 'Borrowers',
        description: 'Borrower management operations'
      },
      {
        name: 'Borrowings',
        description: 'Book borrowing and returning operations'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting operations'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
}; 