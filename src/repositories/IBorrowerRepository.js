
class IBorrowerRepository {
  

  async create(borrowerData) {
    throw new Error('Method must be implemented');
  }
  

  async findById(id) {
    throw new Error('Method must be implemented');
  }
  

  async findByEmail(email) {
    throw new Error('Method must be implemented');
  }
  

  async findAll(options) {
    throw new Error('Method must be implemented');
  }
  

  async update(id, updates) {
    throw new Error('Method must be implemented');
  }
  

  async delete(id) {
    throw new Error('Method must be implemented');
  }
  

  async getCurrentBorrowings(borrowerId) {
    throw new Error('Method must be implemented');
  }
  

  async getBorrowingHistory(borrowerId, options) {
    throw new Error('Method must be implemented');
  }
  

  async getBorrowingStats(borrowerId) {
    throw new Error('Method must be implemented');
  }
}

module.exports = IBorrowerRepository; 