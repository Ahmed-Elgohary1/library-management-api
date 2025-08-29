
class BookController {
  
  constructor(bookService) {
    if (!bookService) {
      throw new Error('BookService is required');
    }
    this.bookService = bookService;
  }
  
  
  async create(req, res) {
    try {
      const result = await this.bookService.createBook(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error creating book:', error);
      
      if (error.message === 'Book with this ISBN already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('quantity')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create book',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async getAll(req, res) {
    try {
      const result = await this.bookService.getAllBooks(req.query);
      
      res.json({
        success: true,
        message: 'Books retrieved successfully',
        data: result.books,
        pagination: result.pagination
      });
      
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch books',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async getById(req, res) {
    try {
      const result = await this.bookService.getBookById(req.params.id);
      
      res.json({
        success: true,
        message: 'Book retrieved successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error fetching book:', error);
      
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch book',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async search(req, res) {
    try {
      const { q: searchTerm, limit = 10 } = req.query;
      
      if (!searchTerm || searchTerm.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }
      
      const result = await this.bookService.searchBooks({ search: searchTerm, limit });
      
      res.json({
        success: true,
        message: 'Search completed successfully',
        data: result.books,
        meta: {
          search_term: searchTerm.trim(),
          result_count: result.books.length
        }
      });
      
    } catch (error) {
      console.error('Error searching books:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search books',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async update(req, res) {
    try {
      const result = await this.bookService.updateBook(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Book updated successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error updating book:', error);
      
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('ISBN already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('quantity')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update book',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async delete(req, res) {
    try {
      await this.bookService.deleteBook(req.params.id);
      
      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting book:', error);
      
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('active borrowings')) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete book with active borrowings'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete book',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async deleteByISBN(req, res) {
    try {
      await this.bookService.deleteBookByISBN(req.params.isbn);
      
      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting book by ISBN:', error);
      
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('active borrowings')) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete book with active borrowings'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete book',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async getLowAvailability(req, res) {
    try {
      const { threshold = 2 } = req.query;
      
      const books = await this.bookService.getLowAvailabilityBooks(parseInt(threshold));
      
      res.json({
        success: true,
        message: 'Low availability books retrieved successfully',
        data: books,
        meta: {
          threshold: parseInt(threshold),
          count: books.length
        }
      });
      
    } catch (error) {
      console.error('Error fetching low availability books:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch low availability books',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = BookController; 