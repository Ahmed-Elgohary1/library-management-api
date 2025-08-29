
class BorrowingController {
  
  constructor(borrowingService) {
    if (!borrowingService) {
      throw new Error('BorrowingService is required');
    }
    this.borrowingService = borrowingService;
  }
  
  
  async checkout(req, res) {
    try {
      const result = await this.borrowingService.checkoutBook(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Book checked out successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error checking out book:', error);
      
      if (error.message === 'Book not found' || error.message === 'Borrower not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'Book not available for checkout') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to checkout book',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async returnBook(req, res) {
    try {
      const { borrowing_id } = req.body;
      const result = await this.borrowingService.returnBook(borrowing_id);
      
      res.json({
        success: true,
        message: 'Book returned successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error returning book:', error);
      
      if (error.message === 'Borrowing not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'Book has already been returned') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to return book',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async getAll(req, res) {
    try {
      const result = await this.borrowingService.getAllBorrowings(req.query);
      
      res.json({
        success: true,
        message: 'Borrowings retrieved successfully',
        data: result.borrowings,
        pagination: result.pagination
      });
      
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch borrowings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async getById(req, res) {
    try {
      const result = await this.borrowingService.getBorrowingById(parseInt(req.params.id));
      
      res.json({
        success: true,
        message: 'Borrowing retrieved successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error fetching borrowing:', error);
      
      if (error.message === 'Borrowing not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch borrowing',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async getOverdue(req, res) {
    try {
      const borrowings = await this.borrowingService.getOverdueBorrowings();
      
      res.json({
        success: true,
        message: 'Overdue borrowings retrieved successfully',
        data: borrowings,
        meta: {
          overdue_count: borrowings.length
        }
      });
      
    } catch (error) {
      console.error('Error fetching overdue borrowings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overdue borrowings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  

  async extendDueDate(req, res) {
    try {
      const borrowingId = parseInt(req.params.id);
      const { new_due_date, extension_reason } = req.body;
      
      const updatedBorrowing = await this.borrowingService.extendDueDate(
        borrowingId, 
        new_due_date, 
        extension_reason
      );
      
      res.json({
        success: true,
        message: 'Due date extended successfully',
        data: updatedBorrowing
      });
      
    } catch (error) {
      console.error('Error extending due date:', error);
      
      if (error.message === 'Active borrowing not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to extend due date',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


  async getByBorrower(req, res) {
    try {
      const borrowerId = parseInt(req.params.borrowerId);
      const result = await this.borrowingService.getBorrowingsByBorrower(borrowerId, req.query);
      
      res.json({
        success: true,
        message: 'Borrower borrowings retrieved successfully',
        data: result.borrowings,
        pagination: result.pagination,
        meta: {
          borrower_id: borrowerId
        }
      });
      
    } catch (error) {
      console.error('Error fetching borrower borrowings:', error);
      
      if (error.message === 'Borrower not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch borrower borrowings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


  async getByBook(req, res) {
    try {
      const bookId = parseInt(req.params.bookId);
      const result = await this.borrowingService.getBorrowingsByBook(bookId, req.query);
      
      res.json({
        success: true,
        message: 'Book borrowings retrieved successfully',
        data: result.borrowings,
        pagination: result.pagination,
        meta: {
          book_id: bookId
        }
      });
      
    } catch (error) {
      console.error('Error fetching book borrowings:', error);
      
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch book borrowings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = BorrowingController; 