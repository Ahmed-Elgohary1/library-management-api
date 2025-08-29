
class BorrowingDTO {


  static toPublicBorrowing(borrowing) {
    if (!borrowing) return null;
    
    return {
      id: borrowing.id,
      book_id: borrowing.book_id,
      borrower_id: borrowing.borrower_id,
      checkout_date: borrowing.checkout_date,
      due_date: borrowing.due_date,
      return_date: borrowing.return_date,
      created_at: borrowing.created_at,
      updated_at: borrowing.updated_at,
      book: borrowing.book ? {
        title: borrowing.book.title,
        author: borrowing.book.author,
        isbn: borrowing.book.isbn
      } : undefined,
      borrower: borrowing.borrower ? {
        name: borrowing.borrower.name,
        email: borrowing.borrower.email
      } : undefined
    };
  }
  

  static fromCheckoutRequest(requestData) {
    const { book_id, borrower_id, due_date } = requestData;
    
    const calculatedDueDate = due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      book_id: parseInt(book_id),
      borrower_id: parseInt(borrower_id),
      due_date: calculatedDueDate,
      checkout_date: new Date().toISOString().split('T')[0]
    };
  }
  

  static fromReturnRequest(requestData) {
    return {
      return_date: new Date().toISOString().split('T')[0]
    };
  }
  

  static toBorrowingsListResponse(borrowings, pagination) {
    return {
      borrowings: borrowings.map(borrowing => this.toPublicBorrowing(borrowing)),
      pagination
    };
  }
  

  static fromSearchQuery(queryParams) {
    const { 
      borrower_id, 
      book_id, 
      status = 'all', 
      page = 1, 
      limit = 10, 
      sortBy = 'checkout_date', 
      sortOrder = 'DESC' 
    } = queryParams;
    
    return {
      borrower_id: borrower_id ? parseInt(borrower_id) : undefined,
      book_id: book_id ? parseInt(book_id) : undefined,
      status: ['all', 'active', 'returned', 'overdue'].includes(status) ? status : 'all',
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit) || 10)),
      sortBy: ['checkout_date', 'due_date', 'return_date'].includes(sortBy) ? sortBy : 'checkout_date',
      sortOrder: ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'
    };
  }
  

  static toDetailedBorrowingResponse(borrowingData) {
    if (!borrowingData) return null;
    
    const borrowing = this.toPublicBorrowing(borrowingData);
    
    return {
      ...borrowing,
      is_overdue: borrowingData.return_date === null && new Date(borrowingData.due_date) < new Date(),
      days_overdue: borrowingData.return_date === null ? 
        Math.max(0, Math.ceil((new Date() - new Date(borrowingData.due_date)) / (1000 * 60 * 60 * 24))) : 0
    };
  }
  

  static toOverdueBorrowingsResponse(overdueBorrowings) {
    return {
      overdue_borrowings: overdueBorrowings.map(borrowing => this.toDetailedBorrowingResponse(borrowing)),
      total_overdue: overdueBorrowings.length
    };
  }
  

  static validateCheckoutData(checkoutData) {
    const { book_id, borrower_id, due_date } = checkoutData;
    
    if (!book_id || isNaN(book_id)) {
      return {
        isValid: false,
        message: 'Valid book ID is required'
      };
    }
    
    if (!borrower_id || isNaN(borrower_id)) {
      return {
        isValid: false,
        message: 'Valid borrower ID is required'
      };
    }
    
    if (due_date && new Date(due_date) <= new Date()) {
      return {
        isValid: false,
        message: 'Due date must be in the future'
      };
    }
    
    return { isValid: true };
  }
}

module.exports = BorrowingDTO; 