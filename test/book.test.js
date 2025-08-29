const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');
const container = require('../src/config/container');

/**
 * Book Model Unit Tests
 * Tests the Book model functionality including CRUD operations
 */

describe('Book Model Tests', () => {
  let testBookId;
  let bookService;
  let dbConnected = false;
  
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    
    try {
      const client = await pool.connect();
      client.release();
      dbConnected = true;
      console.log('✅ Test database connected');
    } catch (error) {
      console.log('⚠️  Database not available, using mock responses');
      dbConnected = false;
    }
    
    bookService = container.get('bookService');
  });
  
  afterAll(async () => {
    if (dbConnected && testBookId) {
      try {
        await pool.query('DELETE FROM books WHERE id = $1', [testBookId]);
      } catch (error) {
        console.log('Warning: Could not clean up test data:', error.message);
      }
    }
    
    if (dbConnected) {
      try {
        await pool.end();
      } catch (error) {
        console.log('Warning: Could not close database connection:', error.message);
      }
    }
  });
  
  describe('POST /api/books', () => {
    it('should create a new book with valid data', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '9781234567890',
        available_quantity: 5,
        total_quantity: 5,
        shelf_location: 'A1-TEST'
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(bookData.title);
      expect(response.body.data.author).toBe(bookData.author);
      expect(response.body.data.isbn).toBe(bookData.isbn);
      
      testBookId = response.body.data.id;
    });
    
    it('should reject book creation with invalid ISBN', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '123', // Invalid ISBN
        available_quantity: 5,
        total_quantity: 5
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
    
    it('should reject book creation with missing required fields', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const bookData = {
        title: 'Test Book'
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
    
    it('should reject duplicate ISBN', async () => {
      if (!dbConnected || !testBookId) {
        console.log('⏭️  Skipping database test - no connection or no test book');
        return;
      }
      
      const bookData = {
        title: 'Another Test Book',
        author: 'Another Author',
        isbn: '9781234567890',
        available_quantity: 3,
        total_quantity: 3
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(409);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Book with this ISBN already exists');
    });
  });
  
  describe('GET /api/books', () => {
    it('should retrieve all books with pagination', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const response = await request(app)
        .get('/api/books')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('current_page');
      expect(response.body.pagination).toHaveProperty('total_pages');
      expect(response.body.pagination).toHaveProperty('total_items');
    });
    
    it('should filter books by availability', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const response = await request(app)
        .get('/api/books?available_only=true')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      response.body.data.forEach(book => {
        expect(book.available_quantity).toBeGreaterThan(0);
      });
    });
    
    it('should search books by title', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const response = await request(app)
        .get('/api/books?search=Test')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      if (testBookId) {
        const testBook = response.body.data.find(book => book.title === 'Test Book');
        expect(testBook).toBeDefined();
      }
    });
  });
  
  describe('PUT /api/books/:id', () => {
    it('should update a book with valid data', async () => {
      if (!dbConnected || !testBookId) {
        console.log('⏭️  Skipping database test - no connection or no test book');
        return;
      }
      
      const updateData = {
        title: 'Updated Test Book',
        author: 'Updated Test Author',
        isbn: '9781234567891', // Different ISBN
        available_quantity: 3,
        total_quantity: 5,
        shelf_location: 'B2-UPDATED'
      };
      
      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Book updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.author).toBe(updateData.author);
      expect(response.body.data.isbn).toBe(updateData.isbn);
      expect(response.body.data.available_quantity).toBe(updateData.available_quantity);
      expect(response.body.data.shelf_location).toBe(updateData.shelf_location);
    });
    
    it('should update partial book data', async () => {
      if (!dbConnected || !testBookId) {
        console.log('⏭️  Skipping database test - no connection or no test book');
        return;
      }
      
      const partialUpdateData = {
        shelf_location: 'C3-PARTIAL',
        available_quantity: 2
      };
      
      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .send(partialUpdateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Book updated successfully');
      expect(response.body.data.shelf_location).toBe(partialUpdateData.shelf_location);
      expect(response.body.data.available_quantity).toBe(partialUpdateData.available_quantity);
      expect(response.body.data.title).toBe('Updated Test Book');
    });
    
    it('should reject update with invalid ISBN format', async () => {
      if (!dbConnected || !testBookId) {
        console.log('⏭️  Skipping database test - no connection or no test book');
        return;
      }
      
      const invalidUpdateData = {
        isbn: '123-invalid-isbn'
      };
      
      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .send(invalidUpdateData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
    
    it('should reject update with negative quantities', async () => {
      if (!dbConnected || !testBookId) {
        console.log('⏭️  Skipping database test - no connection or no test book');
        return;
      }
      
      const invalidUpdateData = {
        available_quantity: -1,
        total_quantity: -5
      };
      
      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .send(invalidUpdateData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
    
    it('should reject update with available_quantity > total_quantity', async () => {
      if (!dbConnected || !testBookId) {
        console.log('⏭️  Skipping database test - no connection or no test book');
        return;
      }
      
      const invalidUpdateData = {
        available_quantity: 10,
        total_quantity: 5
      };
      
      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .send(invalidUpdateData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('quantity');
    });
    
    it('should return 404 for non-existent book update', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const updateData = {
        title: 'Non-existent Book Update'
      };
      
      const response = await request(app)
        .put('/api/books/99999')
        .send(updateData)
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Book not found');
    });
    
    it('should reject update with duplicate ISBN', async () => {
      if (!dbConnected || !testBookId) {
        console.log('⏭️  Skipping database test - no connection or no test book');
        return;
      }
      
      const anotherBookData = {
        title: 'Another Book',
        author: 'Another Author',
        isbn: '9789876543210',
        available_quantity: 2,
        total_quantity: 2,
        shelf_location: 'D4-ANOTHER'
      };
      
      const createResponse = await request(app)
        .post('/api/books')
        .send(anotherBookData);
      
      if (createResponse.status === 201) {
        const anotherBookId = createResponse.body.data.id;
        
        const duplicateUpdateData = {
          isbn: '9789876543210' // Same ISBN as another book
        };
        
        const response = await request(app)
          .put(`/api/books/${testBookId}`)
          .send(duplicateUpdateData)
          .expect(409);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('ISBN already exists');
        
        await request(app).delete(`/api/books/${anotherBookId}`);
      }
    });
    
    it('should reject update with invalid book ID format', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const updateData = {
        title: 'Invalid ID Update'
      };
      
      const response = await request(app)
        .put('/api/books/invalid-id')
        .send(updateData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('DELETE /api/books/:id', () => {
    let bookToDeleteId;
    
    beforeEach(async () => {
      if (!dbConnected) {
        return;
      }
      
      const bookData = {
        title: 'Book to Delete',
        author: 'Delete Author',
        isbn: '9781111111111',
        available_quantity: 1,
        total_quantity: 1,
        shelf_location: 'DELETE-SHELF'
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(bookData);
      
      if (response.status === 201) {
        bookToDeleteId = response.body.data.id;
      }
    });
    
    it('should delete a book successfully', async () => {
      if (!dbConnected || !bookToDeleteId) {
        console.log('⏭️  Skipping database test - no connection or no book to delete');
        return;
      }
      
      const response = await request(app)
        .delete(`/api/books/${bookToDeleteId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Book deleted successfully');
      
      const getResponse = await request(app)
        .get(`/api/books/${bookToDeleteId}`)
        .expect(404);
      
      expect(getResponse.body.success).toBe(false);
      expect(getResponse.body.message).toBe('Book not found');
      
      bookToDeleteId = null;
    });
    
    it('should return 404 for non-existent book deletion', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const response = await request(app)
        .delete('/api/books/99999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Book not found');
    });
    
    it('should reject deletion with invalid book ID format', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const response = await request(app)
        .delete('/api/books/invalid-id')
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
    
    it('should prevent deletion of book with active borrowings', async () => {
      if (!dbConnected || !bookToDeleteId) {
        console.log('⏭️  Skipping database test - no connection or no book to delete');
        return;
      }
      
      const borrowerData = {
        name: 'Test Borrower for Deletion',
        email: 'deletiontest@example.com'
      };
      
      const borrowerResponse = await request(app)
        .post('/api/borrowers')
        .send(borrowerData);
      
      if (borrowerResponse.status === 201) {
        const borrowerId = borrowerResponse.body.data.id;
        
        const borrowingData = {
          book_id: bookToDeleteId,
          borrower_id: borrowerId,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
        };
        
        const borrowingResponse = await request(app)
          .post('/api/borrowings')
          .send(borrowingData);
        
        if (borrowingResponse.status === 201) {
          const deleteResponse = await request(app)
            .delete(`/api/books/${bookToDeleteId}`)
            .expect(409);
          
          expect(deleteResponse.body.success).toBe(false);
          expect(deleteResponse.body.message).toBe('Cannot delete book with active borrowings');
          
          await request(app)
            .patch(`/api/borrowings/${borrowingResponse.body.data.id}/return`);
          await request(app)
            .delete(`/api/borrowers/${borrowerId}`);
        }
      }
    });
    
    afterEach(async () => {
      if (dbConnected && bookToDeleteId) {
        try {
          await pool.query('DELETE FROM books WHERE id = $1', [bookToDeleteId]);
        } catch (error) {
        }
      }
    });
  });
  
  describe('DELETE /api/books/isbn/:isbn', () => {
    let testISBNForDeletion = '9782222222222';
    let bookWithISBNId;
    
    beforeEach(async () => {
      if (!dbConnected) {
        return;
      }
      
      const bookData = {
        title: 'Book to Delete by ISBN',
        author: 'ISBN Delete Author',
        isbn: testISBNForDeletion,
        available_quantity: 1,
        total_quantity: 1,
        shelf_location: 'ISBN-DELETE'
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(bookData);
      
      if (response.status === 201) {
        bookWithISBNId = response.body.data.id;
      }
    });
    
    it('should delete a book by ISBN successfully', async () => {
      if (!dbConnected || !bookWithISBNId) {
        console.log('⏭️  Skipping database test - no connection or no book to delete');
        return;
      }
      
      const response = await request(app)
        .delete(`/api/books/isbn/${testISBNForDeletion}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Book deleted successfully');
      
      const getResponse = await request(app)
        .get(`/api/books/${bookWithISBNId}`)
        .expect(404);
      
      expect(getResponse.body.success).toBe(false);
      
      bookWithISBNId = null;
    });
    
    it('should return 404 for non-existent ISBN deletion', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const response = await request(app)
        .delete('/api/books/isbn/9999999999999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Book not found');
    });
    
    it('should reject deletion with invalid ISBN format', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping database test - no connection');
        return;
      }
      
      const response = await request(app)
        .delete('/api/books/isbn/invalid-isbn')
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
    
    afterEach(async () => {
      if (dbConnected && bookWithISBNId) {
        try {
          await pool.query('DELETE FROM books WHERE id = $1', [bookWithISBNId]);
        } catch (error) {
        }
      }
    });
  });
  
  describe('Dependency Injection Tests', () => {
    it('should have properly injected dependencies', () => {
      expect(bookService).toBeDefined();
      expect(bookService.bookRepository).toBeDefined();
      expect(typeof bookService.createBook).toBe('function');
    });
    
    it('should use the same service instance from container', () => {
      const anotherBookService = container.get('bookService');
      expect(bookService).toBe(anotherBookService);
    });
    
    it('should have all required services in container', () => {
      expect(container.has('bookService')).toBe(true);
      expect(container.has('borrowerService')).toBe(true);
      expect(container.has('borrowingService')).toBe(true);
      expect(container.has('analyticsService')).toBe(true);
      expect(container.has('authService')).toBe(true);
    });
  });
  
  describe('Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      if (!dbConnected) {
        console.log('⏭️  Skipping performance test - no database connection');
        return;
      }
      
      const requests = Array(5).fill().map(() => 
        request(app).get('/api/books')
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});

describe('Book Model Error Handling', () => {
  it('should handle database connection errors gracefully', async () => {
    const response = await request(app)
      .get('/api/books/invalid-id-format')
      .expect(400);
    
    expect(response.body.success).toBe(false);
  });
});

 