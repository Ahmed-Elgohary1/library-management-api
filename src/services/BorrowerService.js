const BorrowerDTO = require('../dto/BorrowerDTO');

/**
 * Borrower Service
 * Handles all borrower-related business logic
 */
class BorrowerService {
  
  constructor(borrowerRepository) {
    if (!borrowerRepository) {
      throw new Error('BorrowerRepository is required');
    }
    this.borrowerRepository = borrowerRepository;
  }
  
  /**
   * Create a new borrower
   * @param {Object} borrowerData - Borrower creation data
   * @returns {Promise<Object>} Created borrower data
   */
  async createBorrower(borrowerData) {
    const sanitizedData = BorrowerDTO.fromCreateRequest(borrowerData);
    
    const emailValidation = BorrowerDTO.validateEmail(sanitizedData.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }
    
    const existingBorrower = await this.borrowerRepository.findByEmail(sanitizedData.email);
    if (existingBorrower) {
      throw new Error('Borrower with this email already exists');
    }
    
    const createdBorrower = await this.borrowerRepository.create(sanitizedData);
    return BorrowerDTO.toPublicBorrower(createdBorrower);
  }
  
  /**
   * Get all borrowers with pagination and search
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Borrowers list with pagination
   */
  async getAllBorrowers(queryParams = {}) {
    const searchOptions = BorrowerDTO.fromSearchQuery(queryParams);
    const result = await this.borrowerRepository.findAll(searchOptions);
    
    return BorrowerDTO.toBorrowersListResponse(result.borrowers, result.pagination);
  }
  
  /**
   * Get borrower by ID
   * @param {number} borrowerId - Borrower ID
   * @returns {Promise<Object>} Borrower data
   */
  async getBorrowerById(borrowerId) {
    const borrower = await this.borrowerRepository.findById(borrowerId);
    if (!borrower) {
      throw new Error('Borrower not found');
    }
    
    return BorrowerDTO.toPublicBorrower(borrower);
  }
  
  /**
   * Update borrower by ID
   * @param {number} borrowerId - Borrower ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated borrower data
   */
  async updateBorrower(borrowerId, updateData) {
    const sanitizedData = BorrowerDTO.fromUpdateRequest(updateData);
    
    const existingBorrower = await this.borrowerRepository.findById(borrowerId);
    if (!existingBorrower) {
      throw new Error('Borrower not found');
    }
    
    if (sanitizedData.email) {
      const emailValidation = BorrowerDTO.validateEmail(sanitizedData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }
      
      if (sanitizedData.email !== existingBorrower.email) {
        const emailExists = await this.borrowerRepository.emailExists(sanitizedData.email, borrowerId);
        if (emailExists) {
          throw new Error('Borrower with this email already exists');
        }
      }
    }
    
    const updatedBorrower = await this.borrowerRepository.update(borrowerId, sanitizedData);
    return BorrowerDTO.toPublicBorrower(updatedBorrower);
  }
  
  /**
   * Delete borrower by ID
   * @param {number} borrowerId - Borrower ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteBorrower(borrowerId) {
    const borrower = await this.borrowerRepository.findById(borrowerId);
    if (!borrower) {
      throw new Error('Borrower not found');
    }
    
    const currentBooks = await this.borrowerRepository.getCurrentBooks(borrowerId);
    if (currentBooks.length > 0) {
      throw new Error('Cannot delete borrower with active borrowings');
    }
    
    const deleted = await this.borrowerRepository.delete(borrowerId);
    if (!deleted) {
      throw new Error('Failed to delete borrower');
    }
    
    return true;
  }
  
  /**
   * Get borrower's current borrowed books
   * @param {number} borrowerId - Borrower ID
   * @returns {Promise<Object>} Borrower with current books
   */
  async getBorrowerCurrentBooks(borrowerId) {
    const borrower = await this.borrowerRepository.findById(borrowerId);
    if (!borrower) {
      throw new Error('Borrower not found');
    }
    
    const currentBooks = await this.borrowerRepository.getCurrentBooks(borrowerId);
    
    return BorrowerDTO.toBorrowerWithBooksResponse({
      ...borrower,
      current_books: currentBooks,
      total_borrowed_books: currentBooks.length
    });
  }
  
  /**
   * Get borrower's overdue books
   * @param {number} borrowerId - Borrower ID
   * @returns {Promise<Object>} Borrower with overdue books
   */
  async getBorrowerOverdueBooks(borrowerId) {
    const borrower = await this.borrowerRepository.findById(borrowerId);
    if (!borrower) {
      throw new Error('Borrower not found');
    }
    
    const overdueBooks = await this.borrowerRepository.getOverdueBooks(borrowerId);
    
    return BorrowerDTO.toBorrowerWithOverdueBooksResponse({
      ...borrower,
      overdue_books: overdueBooks,
      total_overdue_books: overdueBooks.length
    });
  }
  
  /**
   * Get all borrowers with overdue books
   * @returns {Promise<Array>} Borrowers with overdue books
   */
  async getBorrowersWithOverdueBooks() {
    const borrowers = await this.borrowerRepository.findWithOverdueBooks();
    return borrowers.map(borrower => BorrowerDTO.toPublicBorrower(borrower));
  }
  
  /**
   * Search borrowers by name or email
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchBorrowers(searchParams) {
    const searchOptions = BorrowerDTO.fromSearchQuery(searchParams);
    const result = await this.borrowerRepository.findAll(searchOptions);
    
    return BorrowerDTO.toBorrowersListResponse(result.borrowers, result.pagination);
  }
  
  /**
   * Validate borrower exists
   * @param {number} borrowerId - Borrower ID
   * @returns {Promise<boolean>} True if borrower exists
   */
  async validateBorrowerExists(borrowerId) {
    const borrower = await this.borrowerRepository.findById(borrowerId);
    return !!borrower;
  }
  
  /**
   * Get borrower's borrowing history
   * @param {number} borrowerId - Borrower ID
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Borrowing history with pagination
   */
  async getBorrowerHistory(borrowerId, queryParams = {}) {
    const borrower = await this.borrowerRepository.findById(borrowerId);
    if (!borrower) {
      throw new Error('Borrower not found');
    }
    
    const options = {
      page: parseInt(queryParams.page) || 1,
      limit: Math.min(parseInt(queryParams.limit) || 10, 50),
      status: queryParams.status || 'all'
    };
    
    const history = await this.borrowerRepository.getBorrowingHistory(borrowerId, options);
    
    return {
      borrowings: history.borrowings.map(borrowing => ({
        id: borrowing.id,
        book: {
          id: borrowing.book_id,
          title: borrowing.title,
          author: borrowing.author,
          isbn: borrowing.isbn
        },
        checkout_date: borrowing.checkout_date,
        due_date: borrowing.due_date,
        return_date: borrowing.return_date,
        status: borrowing.status,
        days_overdue: borrowing.days_overdue || 0,
        extension_count: borrowing.extension_count || 0,
        extension_reason: borrowing.extension_reason,
        return_notes: borrowing.return_notes
      })),
      pagination: history.pagination
    };
  }
}

module.exports = BorrowerService; 