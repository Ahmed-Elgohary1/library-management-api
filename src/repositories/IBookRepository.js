
class IBookRepository {
  

  async create(bookData) {
    throw new Error('Method must be implemented');
  }
  

  async findById(id) {
    throw new Error('Method must be implemented');
  }
  

  async findByISBN(isbn) {
    throw new Error('Method must be implemented');
  }
  

  async findAll(options) {
    throw new Error('Method must be implemented');
  }
  

  async update(id, updateData) {
    throw new Error('Method must be implemented');
  }
  

  async delete(id) {
    throw new Error('Method must be implemented');
  }
  

  async deleteByISBN(isbn) {
    throw new Error('Method must be implemented');
  }
  
  
  async search(searchOptions) {
    throw new Error('Method must be implemented');
  }
  
  
  async updateAvailability(bookId, quantityChange) {
    throw new Error('Method must be implemented');
  }
  
  
  async findLowAvailability(threshold) {
    throw new Error('Method must be implemented');
  }
}

module.exports = IBookRepository; 