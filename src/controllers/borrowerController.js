
class BorrowerController {
  
  constructor(borrowerService) {
    if (!borrowerService) {
      throw new Error('BorrowerService is required');
    }
    this.borrowerService = borrowerService;
  }
  

  async create(req, res) {
    try {
      const result = await this.borrowerService.createBorrower(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Borrower registered successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error creating borrower:', error);
      
      if (error.message === 'Borrower with this email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to register borrower',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async getAll(req, res) {
    try {
      const result = await this.borrowerService.getAllBorrowers(req.query);
      
      res.json({
        success: true,
        message: 'Borrowers retrieved successfully',
        data: result.borrowers,
        pagination: result.pagination
      });
      
    } catch (error) {
      console.error('Error fetching borrowers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch borrowers',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async getById(req, res) {
    try {
      const result = await this.borrowerService.getBorrowerById(parseInt(req.params.id));
      
      res.json({
        success: true,
        message: 'Borrower retrieved successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error fetching borrower:', error);
      
      if (error.message === 'Borrower not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch borrower',
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
      
      const result = await this.borrowerService.searchBorrowers({ search: searchTerm, limit });
      
      res.json({
        success: true,
        message: 'Search completed successfully',
        data: result.borrowers,
        meta: {
          search_term: searchTerm.trim(),
          result_count: result.borrowers.length
        }
      });
      
    } catch (error) {
      console.error('Error searching borrowers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search borrowers',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async update(req, res) {
    try {
      const result = await this.borrowerService.updateBorrower(parseInt(req.params.id), req.body);
      
      res.json({
        success: true,
        message: 'Borrower updated successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error updating borrower:', error);
      
      if (error.message === 'Borrower not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('email already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update borrower',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async delete(req, res) {
    try {
      await this.borrowerService.deleteBorrower(parseInt(req.params.id));
      
      res.json({
        success: true,
        message: 'Borrower deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting borrower:', error);
      
      if (error.message === 'Borrower not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('active borrowings')) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete borrower with active borrowings'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete borrower',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async getCurrentBooks(req, res) {
    try {
      const books = await this.borrowerService.getBorrowerCurrentBooks(parseInt(req.params.id));
      
      res.json({
        success: true,
        message: 'Current borrowed books retrieved successfully',
        data: books,
        meta: {
          borrower_id: parseInt(req.params.id),
          current_books_count: books.length
        }
      });
      
    } catch (error) {
      console.error('Error fetching current books:', error);
      
      if (error.message === 'Borrower not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current books',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async getBorrowingHistory(req, res) {
    try {
      const history = await this.borrowerService.getBorrowerHistory(parseInt(req.params.id), req.query);
      
      res.json({
        success: true,
        message: 'Borrowing history retrieved successfully',
        data: history.borrowings,
        pagination: history.pagination,
        meta: {
          borrower_id: parseInt(req.params.id)
        }
      });
      
    } catch (error) {
      console.error('Error fetching borrowing history:', error);
      
      if (error.message === 'Borrower not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch borrowing history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async getOverdueBorrowers(req, res) {
    try {
      const borrowers = await this.borrowerService.getOverdueBorrowers();
      
      res.json({
        success: true,
        message: 'Overdue borrowers retrieved successfully',
        data: borrowers,
        meta: {
          overdue_count: borrowers.length
        }
      });
      
    } catch (error) {
      console.error('Error fetching overdue borrowers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overdue borrowers',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = BorrowerController; 