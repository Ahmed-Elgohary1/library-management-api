
class BorrowerDTO {
  
  
  static toPublicBorrower(borrower) {
    if (!borrower) return null;
    
    return {
      id: borrower.id,
      name: borrower.name,
      email: borrower.email,
      registered_date: borrower.registered_date,
      created_at: borrower.created_at,
      updated_at: borrower.updated_at
    };
  }
  
  
  static fromCreateRequest(requestData) {
    const { name, email, registered_date } = requestData;
    
    return {
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      registered_date: registered_date || new Date().toISOString().split('T')[0]
    };
  }
  
  
  static fromUpdateRequest(requestData) {
    const updateData = {};
    
    if (requestData.name !== undefined) {
      updateData.name = requestData.name?.trim();
    }
    if (requestData.email !== undefined) {
      updateData.email = requestData.email?.trim().toLowerCase();
    }
    if (requestData.registered_date !== undefined) {
      updateData.registered_date = requestData.registered_date;
    }
    
    return updateData;
  }
  
  
  static toBorrowersListResponse(borrowers, pagination) {
    return {
      borrowers: borrowers.map(borrower => this.toPublicBorrower(borrower)),
      pagination
    };
  }
  
  
  static fromSearchQuery(queryParams) {
    const { search, page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = queryParams;
    
    return {
      search: search?.trim(),
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit) || 10)),
      sortBy: ['name', 'email', 'registered_date', 'created_at'].includes(sortBy) ? sortBy : 'name',
      sortOrder: ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC'
    };
  }
  
  /**
   * Transform borrower with current books data
   * @param {Object} borrowerData - Borrower data with books
   * @returns {Object} Formatted borrower with books data
   */
  static toBorrowerWithBooksResponse(borrowerData) {
    if (!borrowerData) return null;
    
    return {
      borrower: this.toPublicBorrower(borrowerData),
      current_books: borrowerData.current_books || [],
      total_borrowed_books: borrowerData.total_borrowed_books || 0
    };
  }
  
  /**
   * Transform borrower with overdue books data
   * @param {Object} borrowerData - Borrower data with overdue books
   * @returns {Object} Formatted borrower with overdue books data
   */
  static toBorrowerWithOverdueBooksResponse(borrowerData) {
    if (!borrowerData) return null;
    
    return {
      borrower: this.toPublicBorrower(borrowerData),
      overdue_books: borrowerData.overdue_books || [],
      total_overdue_books: borrowerData.total_overdue_books || 0
    };
  }
  
  
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return {
        isValid: false,
        message: 'Email is required'
      };
    }
    
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: 'Invalid email format'
      };
    }
    
    return { isValid: true };
  }
}

module.exports = BorrowerDTO; 