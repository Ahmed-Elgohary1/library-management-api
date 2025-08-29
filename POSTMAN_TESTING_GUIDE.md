# Library Management API - Postman Testing Guide

This guide provides comprehensive Postman tests for all functional requirements from the Library Management System assessment.

## 🚀 Setup

### Base Configuration
- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **Server Port**: 3000 (default)

### Authentication Setup
1. **Default Admin Credentials**:
   - Username: `admin`
   - Password: `admin123`

2. **Get Authentication Token**:
   ```http
   POST /api/auth/login
   ```
   Use the token in subsequent requests requiring authentication.

---

## 📋 Testing Checklist by Requirements

### ✅ 1. Books Management (CRUD Operations)

#### 1.1 Add a Book
```http
POST /api/books
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Test Book Title",
  "author": "Test Author",
  "isbn": "1234567890",
  "available_quantity": 5,
  "total_quantity": 5,
  "shelf_location": "A1-004"
}
```
**Expected**: 201 Created

#### 1.2 Update Book Details
```http
PUT /api/books/{book_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Book Title",
  "author": "Updated Author",
  "available_quantity": 3,
  "shelf_location": "B2-005"
}
```
**Expected**: 200 OK

#### 1.3 Delete a Book
```http
DELETE /api/books/{book_id}
Authorization: Bearer {token}
```
**Expected**: 200 OK

#### 1.4 List All Books
```http
GET /api/books
```
**Expected**: 200 OK with paginated book list

#### 1.5 Search Books by Title
```http
GET /api/books/search?q=Great Gatsby
```
**Expected**: 200 OK with matching books

#### 1.6 Search Books by Author
```http
GET /api/books/search?q=Scott Fitzgerald
```
**Expected**: 200 OK with matching books

#### 1.7 Search Books by ISBN
```http
GET /api/books/search?q=9780743273565
```
**Expected**: 200 OK with matching book

### ✅ 2. Borrowers Management (CRUD Operations)

#### 2.1 Register a Borrower
```http
POST /api/borrowers
Content-Type: application/json

{
  "name": "Test User",
  "email": "test.user@email.com"
}
```
**Expected**: 201 Created

#### 2.2 Update Borrower Details
```http
PUT /api/borrowers/{borrower_id}
Content-Type: application/json

{
  "name": "Updated Test User",
  "email": "updated.test@email.com"
}
```
**Expected**: 200 OK

#### 2.3 Delete a Borrower
```http
DELETE /api/borrowers/{borrower_id}
```
**Expected**: 200 OK

#### 2.4 List All Borrowers
```http
GET /api/borrowers
```
**Expected**: 200 OK with borrower list

### ✅ 3. Borrowing Process

#### 3.1 Check Out a Book
```http
POST /api/borrowings/checkout
Content-Type: application/json

{
  "book_id": "{book_id}",
  "borrower_id": "{borrower_id}",
  "due_date": "2024-12-31"
}
```
**Expected**: 201 Created

#### 3.2 Return a Book
```http
POST /api/borrowings/{borrowing_id}/return
Content-Type: application/json

{
  "return_notes": "Book returned in good condition"
}
```
**Expected**: 200 OK

#### 3.3 Check Borrower's Current Books
```http
GET /api/borrowers/{borrower_id}/books
```
**Expected**: 200 OK with current borrowed books

#### 3.4 List Overdue Books
```http
GET /api/borrowings/overdue
```
**Expected**: 200 OK with overdue borrowings

### ✅ 4. Additional Functional Tests

#### 4.1 Get Book by ID
```http
GET /api/books/{book_id}
```
**Expected**: 200 OK

#### 4.2 Get Borrower by ID
```http
GET /api/borrowers/{borrower_id}
```
**Expected**: 200 OK

#### 4.3 Get Borrowing History
```http
GET /api/borrowers/{borrower_id}/history
```
**Expected**: 200 OK with borrowing history

#### 4.4 Get Active Borrowings
```http
GET /api/borrowings/active
```
**Expected**: 200 OK

#### 4.5 Get Returned Borrowings
```http
GET /api/borrowings/returned
```
**Expected**: 200 OK

---

## 🎯 Bonus Features Testing

### 🔐 Authentication Tests

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```
**Expected**: 200 OK with JWT token

#### Register New User (Admin Only)
```http
POST /api/auth/register
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "username": "librarian1",
  "password": "password123",
  "role": "librarian"
}
```
**Expected**: 201 Created

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```
**Expected**: 200 OK

### 📊 Analytics & Export Tests

#### Get Analytics Summary
```http
GET /api/analytics/summary
Authorization: Bearer {token}
```
**Expected**: 200 OK with analytics data

#### Export Overdue Borrowings (CSV)
```http
GET /api/analytics/export?type=overdue&format=csv&period=last_month
Authorization: Bearer {token}
```
**Expected**: 200 OK with CSV file

#### Export Borrowing Data (XLSX)
```http
GET /api/analytics/export?type=borrowings&format=xlsx&period=last_month
Authorization: Bearer {token}
```
**Expected**: 200 OK with XLSX file

### ⚡ Rate Limiting Tests

#### Test Book Search Rate Limit
Make 101+ requests to:
```http
GET /api/books/search?q=test
```
**Expected**: 429 Too Many Requests after 100 requests

#### Test Checkout Rate Limit
Make 51+ requests to:
```http
POST /api/borrowings/checkout
```
**Expected**: 429 Too Many Requests after 50 requests

---

## 🧪 Error Handling Tests

### Validation Error Tests

#### Invalid ISBN Format
```http
POST /api/books
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Test Book",
  "author": "Test Author",
  "isbn": "invalid-isbn"
}
```
**Expected**: 400 Bad Request

#### Missing Required Fields
```http
POST /api/borrowers
Content-Type: application/json

{
  "email": "test@email.com"
}
```
**Expected**: 400 Bad Request (missing name)

#### Invalid Email Format
```http
POST /api/borrowers
Content-Type: application/json

{
  "name": "Test User",
  "email": "invalid-email"
}
```
**Expected**: 400 Bad Request

### Not Found Tests

#### Non-existent Book
```http
GET /api/books/00000000-0000-0000-0000-000000000000
```
**Expected**: 404 Not Found

#### Non-existent Borrower
```http
GET /api/borrowers/00000000-0000-0000-0000-000000000000
```
**Expected**: 404 Not Found

### Authorization Tests

#### Access Protected Route Without Token
```http
POST /api/books
Content-Type: application/json

{
  "title": "Test Book"
}
```
**Expected**: 401 Unauthorized

#### Access Admin Route as Regular User
```http
POST /api/auth/register
Authorization: Bearer {non_admin_token}
```
**Expected**: 403 Forbidden

---

## 🔧 Utility Endpoints

### Health Check
```http
GET /health
```
**Expected**: 200 OK

### API Documentation
```http
GET /
```
**Expected**: 200 OK with API overview

### Swagger Documentation
```http
GET /api-docs
```
**Expected**: Swagger UI interface

---

## 📝 Sample Test Data

### Books
- **The Great Gatsby**: ISBN `9780743273565`
- **To Kill a Mockingbird**: ISBN `9780446310789`
- **1984**: ISBN `9780451524935`

### Borrowers
- **John Smith**: `john.smith@email.com`
- **Emma Johnson**: `emma.johnson@email.com`
- **Michael Brown**: `michael.brown@email.com`

### Authentication
- **Admin User**: username `admin`, password `admin123`

---

## 🚨 Important Notes

1. **Authentication Required**: Some endpoints require JWT token
2. **Rate Limiting**: Search (100 req/15min) and Checkout (50 req/15min)
3. **Validation**: All inputs are validated for security
4. **Error Responses**: Always include proper HTTP status codes
5. **Pagination**: Most list endpoints support pagination
6. **Search**: Case-insensitive search across title, author, and ISBN

---

## 📊 Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

This guide covers all functional requirements and bonus features. Test each endpoint systematically to ensure complete API functionality. 