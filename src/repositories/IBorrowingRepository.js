class IBorrowingRepository {
  
  async create(borrowingData) {
    throw new Error('Method must be implemented');
  }
  
  async findById(id) {
    throw new Error('Method must be implemented');
  }
  
  async findAll(options) {
    throw new Error('Method must be implemented');
  }
  
  async returnBook(id, returnDate) {
    throw new Error('Method must be implemented');
  }
  
  async findCurrentByBorrowerId(borrowerId) {
    throw new Error('Method must be implemented');
  }
  
  async findHistoryByBorrowerId(borrowerId, options) {
    throw new Error('Method must be implemented');
  }
  
  async findOverdue(options) {
    throw new Error('Method must be implemented');
  }
  
  async findByBookId(bookId) {
    throw new Error('Method must be implemented');
  }
  
  async getStatistics(options) {
    throw new Error('Method must be implemented');
  }
  

  async findByDateRange(startDate, endDate, options) {
    throw new Error('Method must be implemented');
  }
}

module.exports = IBorrowingRepository; 