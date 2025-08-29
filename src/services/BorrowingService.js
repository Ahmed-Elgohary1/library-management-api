const BorrowingDTO = require('../dto/BorrowingDTO');

/**
 * Borrowing Service
 * Handles all borrowing-related business logic
 */
class BorrowingService {
  
  constructor(borrowingRepository, bookRepository, borrowerRepository) {
    if (!borrowingRepository) {
      throw new Error('BorrowingRepository is required');
    }
    if (!bookRepository) {
      throw new Error('BookRepository is required');
    }
    if (!borrowerRepository) {
      throw new Error('BorrowerRepository is required');
    }
    this.borrowingRepository = borrowingRepository;
    this.bookRepository = bookRepository;
    this.borrowerRepository = borrowerRepository;
  }
  
  /**
   * Check out a book to a borrower
   * @param {Object} checkoutData - Checkout data
   * @returns {Promise<Object>} Created borrowing record
   */
  async checkoutBook(checkoutData) {
    const sanitizedData = BorrowingDTO.fromCheckoutRequest(checkoutData);
    
    const validation = BorrowingDTO.validateCheckoutData(sanitizedData);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    const book = await this.bookRepository.findById(sanitizedData.book_id);
    if (!book) {
      throw new Error('Book not found');
    }
    
    if (book.available_quantity <= 0) {
      throw new Error('Book is not available for checkout');
    }
    
    const borrower = await this.borrowerRepository.findById(sanitizedData.borrower_id);
    if (!borrower) {
      throw new Error('Borrower not found');
    }
    
    const hasActiveBorrowing = await this.borrowingRepository.hasActiveBorrowing(
      sanitizedData.borrower_id, 
      sanitizedData.book_id
    );
    
    if (hasActiveBorrowing) {
      throw new Error('Borrower already has this book checked out');
    }
    
    const borrowing = await this.borrowingRepository.create(sanitizedData);
    
    return BorrowingDTO.toDetailedBorrowingResponse({
      ...borrowing,
      book: { title: borrowing.title, author: borrowing.author, isbn: borrowing.isbn },
      borrower: { name: borrowing.borrower_name, email: borrowing.borrower_email }
    });
  }
  
  /**
   * Return a book
   * @param {number} borrowingId - Borrowing ID
   * @returns {Promise<Object>} Updated borrowing record
   */
  async returnBook(borrowingId) {
    const returnData = BorrowingDTO.fromReturnRequest({});
    
    const borrowing = await this.borrowingRepository.findById(borrowingId);
    if (!borrowing) {
      throw new Error('Borrowing not found');
    }
    
    if (borrowing.return_date) {
      throw new Error('Book has already been returned');
    }
    
    const updatedBorrowing = await this.borrowingRepository.returnBook(borrowingId, returnData.return_date);
    
    return BorrowingDTO.toDetailedBorrowingResponse({
      ...updatedBorrowing,
      book: { title: updatedBorrowing.title, author: updatedBorrowing.author, isbn: updatedBorrowing.isbn },
      borrower: { name: updatedBorrowing.borrower_name, email: updatedBorrowing.borrower_email }
    });
  }
  
  /**
   * Get all borrowings with filtering and pagination
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Borrowings list with pagination
   */
  async getAllBorrowings(queryParams = {}) {
    const searchOptions = BorrowingDTO.fromSearchQuery(queryParams);
    const result = await this.borrowingRepository.findAll(searchOptions);
    
    const transformedBorrowings = result.borrowings.map(borrowing => ({
      ...borrowing,
      book: { title: borrowing.title, author: borrowing.author, isbn: borrowing.isbn },
      borrower: { name: borrowing.borrower_name, email: borrowing.borrower_email }
    }));
    
    return BorrowingDTO.toBorrowingsListResponse(transformedBorrowings, result.pagination);
  }
  
  /**
   * Get borrowing by ID
   * @param {number} borrowingId - Borrowing ID
   * @returns {Promise<Object>} Borrowing data
   */
  async getBorrowingById(borrowingId) {
    const borrowing = await this.borrowingRepository.findById(borrowingId);
    if (!borrowing) {
      throw new Error('Borrowing not found');
    }
    
    return BorrowingDTO.toDetailedBorrowingResponse({
      ...borrowing,
      book: { title: borrowing.title, author: borrowing.author, isbn: borrowing.isbn },
      borrower: { name: borrowing.borrower_name, email: borrowing.borrower_email }
    });
  }
  
  /**
   * Get all overdue borrowings
   * @returns {Promise<Object>} Overdue borrowings response
   */
  async getOverdueBorrowings() {
    const overdueBorrowings = await this.borrowingRepository.findOverdue();
    
    const transformedBorrowings = overdueBorrowings.map(borrowing => ({
      ...borrowing,
      book: { title: borrowing.title, author: borrowing.author, isbn: borrowing.isbn },
      borrower: { name: borrowing.borrower_name, email: borrowing.borrower_email }
    }));
    
    return BorrowingDTO.toOverdueBorrowingsResponse(transformedBorrowings);
  }
  
  /**
   * Get borrowing statistics for a date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} Borrowing statistics
   */
  async getBorrowingStatistics(startDate, endDate) {
    const stats = await this.borrowingRepository.getStatistics(startDate, endDate);
    
    return {
      period: {
        start_date: startDate,
        end_date: endDate
      },
      statistics: {
        total_borrowings: parseInt(stats.total_borrowings),
        returned_books: parseInt(stats.returned_books),
        active_borrowings: parseInt(stats.active_borrowings),
        overdue_books: parseInt(stats.overdue_books)
      }
    };
  }
  
  /**
   * Validate checkout is possible
   * @param {number} bookId - Book ID
   * @param {number} borrowerId - Borrower ID
   * @returns {Promise<Object>} Validation result
   */
  async validateCheckout(bookId, borrowerId) {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      return { isValid: false, message: 'Book not found' };
    }
    
    if (book.available_quantity <= 0) {
      return { isValid: false, message: 'Book is not available for checkout' };
    }
    
    const borrower = await this.borrowerRepository.findById(borrowerId);
    if (!borrower) {
      return { isValid: false, message: 'Borrower not found' };
    }
    
    const hasActiveBorrowing = await this.borrowingRepository.hasActiveBorrowing(borrowerId, bookId);
    if (hasActiveBorrowing) {
      return { isValid: false, message: 'Borrower already has this book checked out' };
    }
    
    return { isValid: true };
  }

  /**
   * Get borrowings by borrower
   * @param {number} borrowerId - Borrower ID
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Borrowings with pagination
   */
  async getBorrowingsByBorrower(borrowerId, queryParams = {}) {
    const borrower = await this.borrowerRepository.findById(borrowerId);
    if (!borrower) {
      throw new Error('Borrower not found');
    }

    const options = {
      borrower_id: borrowerId,
      page: parseInt(queryParams.page) || 1,
      limit: Math.min(parseInt(queryParams.limit) || 10, 50),
      status: queryParams.status || 'all',
      sortBy: queryParams.sortBy || 'checkout_date',
      sortOrder: queryParams.sortOrder || 'DESC'
    };

    const result = await this.borrowingRepository.findAll(options);

    return {
      borrowings: result.borrowings.map(borrowing => 
        BorrowingDTO.toDetailedBorrowingResponse({
          ...borrowing,
          book: { title: borrowing.title, author: borrowing.author, isbn: borrowing.isbn },
          borrower: { name: borrowing.borrower_name, email: borrowing.borrower_email }
        })
      ),
      pagination: result.pagination
    };
  }

  /**
   * Get borrowings by book
   * @param {number} bookId - Book ID
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Borrowings with pagination
   */
  async getBorrowingsByBook(bookId, queryParams = {}) {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    const options = {
      book_id: bookId,
      page: parseInt(queryParams.page) || 1,
      limit: Math.min(parseInt(queryParams.limit) || 10, 50),
      status: queryParams.status || 'all',
      sortBy: queryParams.sortBy || 'checkout_date',
      sortOrder: queryParams.sortOrder || 'DESC'
    };

    const result = await this.borrowingRepository.findAll(options);

    return {
      borrowings: result.borrowings.map(borrowing => 
        BorrowingDTO.toDetailedBorrowingResponse({
          ...borrowing,
          book: { title: borrowing.title, author: borrowing.author, isbn: borrowing.isbn },
          borrower: { name: borrowing.borrower_name, email: borrowing.borrower_email }
        })
      ),
      pagination: result.pagination
    };
  }

  /**
   * Extend due date for a borrowing
   * @param {number} borrowingId - Borrowing ID
   * @param {string} newDueDate - New due date
   * @param {string} extensionReason - Reason for extension
   * @returns {Promise<Object>} Updated borrowing record
   */
  async extendDueDate(borrowingId, newDueDate, extensionReason) {
    const newDate = new Date(newDueDate);
    const today = new Date();
    
    if (isNaN(newDate.getTime())) {
      throw new Error('Invalid due date format');
    }
    
    if (newDate <= today) {
      throw new Error('New due date must be in the future');
    }
    
    const updatedBorrowing = await this.borrowingRepository.extendDueDate(
      borrowingId, 
      newDueDate, 
      extensionReason
    );
    
    return BorrowingDTO.toDetailedBorrowingResponse({
      ...updatedBorrowing,
      book: { title: updatedBorrowing.title, author: updatedBorrowing.author, isbn: updatedBorrowing.isbn },
      borrower: { name: updatedBorrowing.borrower_name, email: updatedBorrowing.borrower_email }
    });
  }
}

module.exports = BorrowingService; 