const BorrowingRepository = require('../repositories/BorrowingRepository');
const BookRepository = require('../repositories/BookRepository');
const BorrowerRepository = require('../repositories/BorrowerRepository');

/**
 * Analytics Service
 * Handles all analytics-related business logic
 */
class AnalyticsService {
  
  constructor(bookRepository, borrowerRepository, borrowingRepository) {
    if (!bookRepository) {
      throw new Error('BookRepository is required');
    }
    if (!borrowerRepository) {
      throw new Error('BorrowerRepository is required');
    }
    if (!borrowingRepository) {
      throw new Error('BorrowingRepository is required');
    }
    this.bookRepository = bookRepository;
    this.borrowerRepository = borrowerRepository;
    this.borrowingRepository = borrowingRepository;
  }
  
  /**
   * Get borrowing analytics for a date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} Borrowing analytics data
   */
  async getBorrowingAnalytics(startDate, endDate) {
    const stats = await this.borrowingRepository.getStatistics(startDate, endDate);
    const overdueBorrowings = await this.borrowingRepository.findOverdue();
    
    return {
      period: {
        start_date: startDate,
        end_date: endDate
      },
      borrowing_statistics: {
        total_borrowings: parseInt(stats.total_borrowings),
        returned_books: parseInt(stats.returned_books),
        active_borrowings: parseInt(stats.active_borrowings),
        overdue_books: parseInt(stats.overdue_books)
      },
      overdue_details: overdueBorrowings.map(borrowing => ({
        borrowing_id: borrowing.id,
        book: {
          title: borrowing.title,
          author: borrowing.author,
          isbn: borrowing.isbn
        },
        borrower: {
          name: borrowing.borrower_name,
          email: borrowing.borrower_email
        },
        checkout_date: borrowing.checkout_date,
        due_date: borrowing.due_date,
        days_overdue: borrowing.days_overdue
      }))
    };
  }
  
  /**
   * Get book analytics
   * @returns {Promise<Object>} Book analytics data
   */
  async getBookAnalytics() {
    const lowAvailabilityBooks = await this.bookRepository.findLowAvailability(2);
    
    return {
      inventory_status: {
        low_availability_books: lowAvailabilityBooks.length,
        books_needing_attention: lowAvailabilityBooks.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          available_quantity: book.available_quantity,
          total_quantity: book.total_quantity
        }))
      }
    };
  }
  
  /**
   * Get borrower analytics
   * @returns {Promise<Object>} Borrower analytics data
   */
  async getBorrowerAnalytics() {
    const borrowersWithOverdue = await this.borrowerRepository.findWithOverdueBooks();
    
    return {
      borrower_status: {
        borrowers_with_overdue: borrowersWithOverdue.length,
        overdue_borrowers: borrowersWithOverdue.map(borrower => ({
          id: borrower.id,
          name: borrower.name,
          email: borrower.email,
          overdue_count: borrower.overdue_count
        }))
      }
    };
  }
  
  /**
   * Get analytics summary (alias for generateAnalyticsReport)
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} Analytics summary data
   */
  async getAnalyticsSummary(startDate, endDate) {
    return this.generateAnalyticsReport(startDate, endDate);
  }

  /**
   * Get overdue analytics data
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Array>} Overdue borrowings data formatted for export
   */
  async getOverdueAnalytics(startDate, endDate) {
    const overdueBorrowings = await this.borrowingRepository.findOverdue();
    
    return overdueBorrowings.map(borrowing => ({
      id: borrowing.id,
      book_title: borrowing.title,
      book_author: borrowing.author,
      book_isbn: borrowing.isbn,
      borrower_name: borrowing.borrower_name,
      borrower_email: borrowing.borrower_email,
      checkout_date: borrowing.checkout_date,
      due_date: borrowing.due_date,
      return_date: borrowing.return_date,
      status: 'Overdue',
      days_overdue: borrowing.days_overdue
    }));
  }

  /**
   * Get popular books analytics
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {number} limit - Number of books to return
   * @returns {Promise<Array>} Popular books data
   */
  async getPopularBooks(startDate, endDate, limit = 10) {
    const borrowings = await this.borrowingRepository.findAll({
      page: 1,
      limit: 1000, // Get more records to analyze
      sortBy: 'checkout_date',
      sortOrder: 'DESC'
    });
    
    const bookStats = {};
    borrowings.borrowings
      .filter(borrowing => {
        const checkoutDate = borrowing.checkout_date;
        if (startDate && checkoutDate < startDate) return false;
        if (endDate && checkoutDate > endDate) return false;
        return true;
      })
      .forEach(borrowing => {
        const bookId = borrowing.book_id;
        if (!bookStats[bookId]) {
          bookStats[bookId] = {
            book_id: bookId,
            title: borrowing.title,
            author: borrowing.author,
            isbn: borrowing.isbn,
            borrow_count: 0
          };
        }
        bookStats[bookId].borrow_count++;
      });
    
    return Object.values(bookStats)
      .sort((a, b) => b.borrow_count - a.borrow_count)
      .slice(0, limit);
  }

  /**
   * Generate comprehensive analytics report
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} Comprehensive analytics data
   */
  async generateAnalyticsReport(startDate, endDate) {
    const [borrowingAnalytics, bookAnalytics, borrowerAnalytics] = await Promise.all([
      this.getBorrowingAnalytics(startDate, endDate),
      this.getBookAnalytics(),
      this.getBorrowerAnalytics()
    ]);
    
    return {
      report_generated_at: new Date().toISOString(),
      ...borrowingAnalytics,
      ...bookAnalytics,
      ...borrowerAnalytics
    };
  }
  
  /**
   * Export data for analytics
   * @param {string} type - Export type ('overdue' or 'borrowings')
   * @param {string} format - Export format ('csv' or 'xlsx')
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Export data
   */
  async exportData(type, format, options = {}) {
    let data = [];
    let filename = '';
    
    if (type === 'overdue') {
      const overdueBorrowings = await this.borrowingRepository.findOverdue();
      data = overdueBorrowings.map(borrowing => ({
        'Borrower Name': borrowing.borrower_name,
        'Borrower Email': borrowing.borrower_email,
        'Book Title': borrowing.title,
        'Book Author': borrowing.author,
        'ISBN': borrowing.isbn,
        'Checkout Date': borrowing.checkout_date,
        'Due Date': borrowing.due_date,
        'Days Overdue': borrowing.days_overdue
      }));
      filename = `overdue_books_${new Date().toISOString().split('T')[0]}`;
    } else if (type === 'borrowings') {
      const { startDate, endDate } = options;
      const borrowings = await this.borrowingRepository.findAll({
        page: 1,
        limit: 10000, // Large limit for export
        sortBy: 'checkout_date',
        sortOrder: 'DESC'
      });
      
      data = borrowings.borrowings
        .filter(borrowing => {
          if (startDate && borrowing.checkout_date < startDate) return false;
          if (endDate && borrowing.checkout_date > endDate) return false;
          return true;
        })
        .map(borrowing => ({
          'Borrower Name': borrowing.borrower_name,
          'Borrower Email': borrowing.borrower_email,
          'Book Title': borrowing.title,
          'Book Author': borrowing.author,
          'ISBN': borrowing.isbn,
          'Checkout Date': borrowing.checkout_date,
          'Due Date': borrowing.due_date,
          'Return Date': borrowing.return_date || 'Not Returned',
          'Status': borrowing.return_date ? 'Returned' : 
                   (new Date(borrowing.due_date) < new Date() ? 'Overdue' : 'Active')
        }));
      filename = `borrowings_${startDate || 'all'}_to_${endDate || 'now'}`;
    }
    
    return {
      data,
      filename,
      format
    };
  }
}

module.exports = AnalyticsService; 