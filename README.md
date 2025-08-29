# Library Management System API

A comprehensive RESTful API for managing library operations, built with Node.js, Express, and PostgreSQL.

## 🚀 Features

### Core Functionality
- **Book Management**: Complete CRUD operations for books with search capabilities
- **Borrower Management**: Register and manage library borrowers
- **Borrowing System**: Book checkout, return, and overdue tracking
- **Advanced Search**: Full-text search across books by title, author, or ISBN
- **Analytics & Reporting**: Generate insights and export data in CSV/XLSX formats

### Technical Features
- **Authentication**: JWT-based authentication system
- **Rate Limiting**: Prevent API abuse with configurable rate limits
- **Input Validation**: Comprehensive validation to prevent SQL injection
- **Error Handling**: Robust error handling with meaningful responses
- **Database Optimization**: Indexed queries for optimal read performance
- **Docker Support**: Full containerization with Docker Compose
- **Unit Testing**: Comprehensive test coverage

## 📋 Requirements

- Node.js 16+ 
- PostgreSQL 12+
- Docker & Docker Compose (optional)

## 🛠️ Installation & Setup

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ahmed-Elgohary1/library-management-api.git
   cd library-management-api
   ```

2. **Start with Docker Compose**
   ```bash
   docker compose up -d
   ```

3. **Verify the setup**
   ```bash
   curl http://localhost:3000/health
   ```

### Option 2: Manual Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/Ahmed-Elgohary1/library-management-api.git
   cd library-management-api
   npm install
   ```

2. **Setup PostgreSQL database**
   ```sql
   CREATE DATABASE library_management;
   ```

3. **Configure environment variables**
   ```bash
   # Copy environment template
   cp env.example .env
   # Edit .env with your database credentials and settings
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Seed sample data (optional)**
   ```bash
   npm run db:seed
   ```

6. **Start the server**
   ```bash
   npm start
   # For development
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_management
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Books API

#### Create Book
```http
POST /api/books
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "available_quantity": 5,
  "total_quantity": 5,
  "shelf_location": "A1-001"
}
```

#### Get All Books
```http
GET /api/books?page=1&limit=10&search=gatsby&available_only=true
```

#### Get Book by ID
```http
GET /api/books/{book_id}
```

#### Update Book
```http
PUT /api/books/{book_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "available_quantity": 3,
  "shelf_location": "B2-001"
}
```

#### Delete Book
```http
DELETE /api/books/{book_id}
Authorization: Bearer <token>
```

#### Search Books
```http
GET /api/books/search?q=gatsby&limit=10
```

### Borrowers API

#### Register Borrower
```http
POST /api/borrowers
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Smith",
  "email": "john.smith@email.com",
  "registered_date": "2024-01-15"
}
```

#### Get All Borrowers
```http
GET /api/borrowers?page=1&limit=10&search=john
```

#### Get Borrower's Current Books
```http
GET /api/borrowers/{borrower_id}/books
```

#### Get Borrower's History
```http
GET /api/borrowers/{borrower_id}/history?page=1&limit=10
```

### Borrowings API

#### Check Out Book
```http
POST /api/borrowings/checkout
Content-Type: application/json
Authorization: Bearer <token>

{
  "book_id": 1,
  "borrower_id": 1,
  "due_date": "2024-02-15"
}
```

#### Return Book
```http
POST /api/borrowings/{borrowing_id}/return
Content-Type: application/json
Authorization: Bearer <token>

{
  "return_date": "2024-02-10"
}
```

#### Get Overdue Books
```http
GET /api/borrowings/overdue?limit=50
```

#### Get Borrowing Statistics
```http
GET /api/borrowings/statistics?period_days=30
```

### Analytics API

#### Export Data
```http
GET /api/analytics/export?type=overdue&format=csv&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

#### Get Analytics Summary
```http
GET /api/analytics/summary?period_days=30
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Tables

#### Books
```sql
- id (SERIAL, Primary Key)
- title (VARCHAR(255), NOT NULL)
- author (VARCHAR(255), NOT NULL) 
- isbn (VARCHAR(13), UNIQUE, NOT NULL)
- available_quantity (INTEGER, DEFAULT 0)
- total_quantity (INTEGER, DEFAULT 0)
- shelf_location (VARCHAR(50))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Borrowers
```sql
- id (SERIAL, Primary Key)
- name (VARCHAR(255), NOT NULL)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- registered_date (DATE, DEFAULT CURRENT_DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Borrowings
```sql
- id (SERIAL, Primary Key)
- book_id (INTEGER, Foreign Key → books.id)
- borrower_id (INTEGER, Foreign Key → borrowers.id)
- checkout_date (DATE, DEFAULT CURRENT_DATE)
- due_date (DATE, NOT NULL)
- return_date (DATE, NULL)
- is_returned (BOOLEAN, DEFAULT FALSE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Indexes

Optimized indexes for read performance:
- Full-text search indexes on book titles and authors
- Composite indexes for common query patterns
- Partial indexes for active borrowings and overdue books

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- test/book.test.js
```

## 🔒 Security Features

- **Input Validation**: All inputs validated using express-validator
- **SQL Injection Prevention**: Parameterized queries throughout
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Rate Limiting**: Configurable rate limits on sensitive endpoints
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for production deployment

## 📊 Performance Optimizations

- **Database Indexing**: Strategic indexes for common queries
- **Connection Pooling**: PostgreSQL connection pooling
- **Query Optimization**: Efficient SQL queries with proper joins
- **Pagination**: All list endpoints support pagination
- **Compression**: Gzip compression for responses

## 🚀 Deployment

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Scale the application**
   ```bash
   docker-compose up -d --scale api=3
   ```

### Manual Deployment

1. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

2. **Install production dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Run migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## 📈 Monitoring & Health Checks

### Health Check Endpoint
```http
GET /health
```

Response:
```json
{
  "success": true,
  "message": "Library Management System API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Logging

The application uses Morgan for HTTP request logging in production. All errors are logged to the console with appropriate detail levels.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": { ... } // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ], // Validation errors
  "error": "Stack trace" // Development only
}
```

## 🎯 Future Enhancements

- **Reservation System**: Allow users to reserve books
- **Review System**: Book reviews and ratings
- **Notification System**: Email/SMS notifications for due dates
- **Fine Management**: Calculate and track overdue fines
- **Multi-branch Support**: Support for multiple library branches
- **Advanced Analytics**: More detailed reporting and insights

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for efficient library management** 
