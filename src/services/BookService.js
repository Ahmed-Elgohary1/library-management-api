const BookDTO = require('../dto/BookDTO');


class BookService {
  
  constructor(bookRepository, borrowingRepository) {
    if (!bookRepository) {
      throw new Error('BookRepository is required');
    }
    if (!borrowingRepository) {
      throw new Error('BorrowingRepository is required');
    }
    this.bookRepository = bookRepository;
    this.borrowingRepository = borrowingRepository;
  }
  

  async createBook(bookData) {
    const sanitizedData = BookDTO.fromCreateRequest(bookData);
    
    const quantityValidation = BookDTO.validateQuantities(sanitizedData);
    if (!quantityValidation.isValid) {
      throw new Error(quantityValidation.message);
    }
    
    const existingBook = await this.bookRepository.findByISBN(sanitizedData.isbn);
    if (existingBook) {
      throw new Error('Book with this ISBN already exists');
    }
    
    const createdBook = await this.bookRepository.create(sanitizedData);
    return BookDTO.toPublicBook(createdBook);
  }
  

  async getAllBooks(queryParams = {}) {
    const searchOptions = BookDTO.fromSearchQuery(queryParams);
    
    let result;
    if (searchOptions.search || searchOptions.author) {
      result = await this.bookRepository.search(searchOptions);
    } else {
      result = await this.bookRepository.findAll(searchOptions);
    }
    
    return BookDTO.toBooksListResponse(result.books, result.pagination);
  }
  

  async getBookById(bookId) {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    
    return BookDTO.toPublicBook(book);
  }
  

  async updateBook(bookId, updateData) {
    const sanitizedData = BookDTO.fromUpdateRequest(updateData);
    
    const existingBook = await this.bookRepository.findById(bookId);
    if (!existingBook) {
      throw new Error('Book not found');
    }
    
    if (sanitizedData.isbn && sanitizedData.isbn !== existingBook.isbn) {
      const isbnExists = await this.bookRepository.isbnExists(sanitizedData.isbn, bookId);
      if (isbnExists) {
        throw new Error('Book with this ISBN already exists');
      }
    }
    
    const finalData = { ...existingBook, ...sanitizedData };
    const quantityValidation = BookDTO.validateQuantities(finalData);
    if (!quantityValidation.isValid) {
      throw new Error(quantityValidation.message);
    }
    
    const updatedBook = await this.bookRepository.update(bookId, sanitizedData);
    return BookDTO.toPublicBook(updatedBook);
  }
  

  async deleteBook(bookId) {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    
    const hasActiveBorrowings = await this.borrowingRepository.hasActiveBookBorrowings(bookId);
    if (hasActiveBorrowings) {
      throw new Error('Cannot delete book with active borrowings');
    }
    
    const deleted = await this.bookRepository.delete(bookId);
    if (!deleted) {
      throw new Error('Failed to delete book');
    }
    
    return true;
  }
  
  async deleteBookByISBN(isbn) {
    const book = await this.bookRepository.findByISBN(isbn);
    if (!book) {
      throw new Error('Book not found');
    }
    
    const hasActiveBorrowings = await this.borrowingRepository.hasActiveBookBorrowings(book.id);
    if (hasActiveBorrowings) {
      throw new Error('Cannot delete book with active borrowings');
    }
    
    const deleted = await this.bookRepository.deleteByISBN(isbn);
    if (!deleted) {
      throw new Error('Failed to delete book');
    }
    
    return true;
  }
  

  async searchBooks(searchParams) {
    const searchOptions = BookDTO.fromSearchQuery(searchParams);
    const result = await this.bookRepository.search(searchOptions);
    
    return BookDTO.toBooksListResponse(result.books, result.pagination);
  }
  

  async getLowAvailabilityBooks(threshold = 2) {
    const books = await this.bookRepository.findLowAvailability(threshold);
    return books.map(book => BookDTO.toPublicBook(book));
  }
  

  async updateBookAvailability(bookId, quantityChange) {
    const updatedBook = await this.bookRepository.updateAvailability(bookId, quantityChange);
    if (!updatedBook) {
      throw new Error('Failed to update book availability or insufficient quantity');
    }
    
    return BookDTO.toPublicBook(updatedBook);
  }
  

  async isBookAvailable(bookId) {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    
    return book.available_quantity > 0;
  }
  

  async getBookStatistics() {
    return {
      total_books: 0,
      available_books: 0,
      borrowed_books: 0,
      low_availability_books: 0
    };
  }
}

module.exports = BookService; 