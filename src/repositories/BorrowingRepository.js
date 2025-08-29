const { pool } = require('../config/database');
const IBorrowingRepository = require('./IBorrowingRepository');


class BorrowingRepository extends IBorrowingRepository {
  

  async create({ book_id, borrower_id, checkout_date, due_date }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const bookCheck = await client.query(
        'SELECT available_quantity FROM books WHERE id = $1 FOR UPDATE',
        [book_id]
      );
      
      if (!bookCheck.rows[0] || bookCheck.rows[0].available_quantity <= 0) {
        throw new Error('Book is not available for checkout');
      }
      
      const borrowerCheck = await client.query(
        'SELECT id FROM borrowers WHERE id = $1',
        [borrower_id]
      );
      
      if (!borrowerCheck.rows[0]) {
        throw new Error('Borrower not found');
      }
      
      const borrowingResult = await client.query(
        `INSERT INTO borrowings (book_id, borrower_id, checkout_date, due_date)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [book_id, borrower_id, checkout_date, due_date]
      );
      
      await client.query(
        'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = $1',
        [book_id]
      );
      
      await client.query('COMMIT');
      
      const detailsResult = await pool.query(`
        SELECT 
          br.*,
          b.title, b.author, b.isbn,
          brw.name as borrower_name, brw.email as borrower_email
        FROM borrowings br
        JOIN books b ON br.book_id = b.id
        JOIN borrowers brw ON br.borrower_id = brw.id
        WHERE br.id = $1
      `, [borrowingResult.rows[0].id]);
      
      return detailsResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  

  async findById(id) {
    const query = `
      SELECT 
        br.*,
        b.title, b.author, b.isbn,
        brw.name as borrower_name, brw.email as borrower_email
      FROM borrowings br
      JOIN books b ON br.book_id = b.id
      JOIN borrowers brw ON br.borrower_id = brw.id
      WHERE br.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  

  async returnBook(borrowingId, returnDate) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const borrowingResult = await client.query(
        'SELECT * FROM borrowings WHERE id = $1 AND return_date IS NULL FOR UPDATE',
        [borrowingId]
      );
      
      if (!borrowingResult.rows[0]) {
        throw new Error('Active borrowing not found');
      }
      
      const borrowing = borrowingResult.rows[0];
      
      const updateResult = await client.query(
        'UPDATE borrowings SET return_date = $2 WHERE id = $1 RETURNING *',
        [borrowingId, returnDate]
      );
      
      await client.query(
        'UPDATE books SET available_quantity = available_quantity + 1 WHERE id = $1',
        [borrowing.book_id]
      );
      
      await client.query('COMMIT');
      
      const detailsResult = await pool.query(`
        SELECT 
          br.*,
          b.title, b.author, b.isbn,
          brw.name as borrower_name, brw.email as borrower_email
        FROM borrowings br
        JOIN books b ON br.book_id = b.id
        JOIN borrowers brw ON br.borrower_id = brw.id
        WHERE br.id = $1
      `, [borrowingId]);
      
      return detailsResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  

  async findAll({ borrower_id, book_id, status = 'all', page = 1, limit = 10, sortBy = 'checkout_date', sortOrder = 'DESC' }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 1;
    
    if (borrower_id) {
      conditions.push(`br.borrower_id = $${paramCount}`);
      params.push(borrower_id);
      paramCount++;
    }
    
    if (book_id) {
      conditions.push(`br.book_id = $${paramCount}`);
      params.push(book_id);
      paramCount++;
    }
    
    if (status === 'active') {
      conditions.push('br.return_date IS NULL');
    } else if (status === 'returned') {
      conditions.push('br.return_date IS NOT NULL');
    } else if (status === 'overdue') {
      conditions.push('br.return_date IS NULL AND br.due_date < CURRENT_DATE');
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const allowedSortFields = ['checkout_date', 'due_date', 'return_date'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? `br.${sortBy}` : 'br.checkout_date';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    const query = `
      SELECT 
        br.*,
        b.title, b.author, b.isbn,
        brw.name as borrower_name, brw.email as borrower_email
      FROM borrowings br
      JOIN books b ON br.book_id = b.id
      JOIN borrowers brw ON br.borrower_id = brw.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    const countQuery = `
      SELECT COUNT(*) FROM borrowings br
      ${whereClause}
    `;
    
    params.push(limit, offset);
    
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    return {
      borrowings: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  

  async findOverdue() {
    const query = `
      SELECT 
        br.*,
        b.title, b.author, b.isbn,
        brw.name as borrower_name, brw.email as borrower_email,
        CURRENT_DATE - br.due_date as days_overdue
      FROM borrowings br
      JOIN books b ON br.book_id = b.id
      JOIN borrowers brw ON br.borrower_id = brw.id
      WHERE br.return_date IS NULL AND br.due_date < CURRENT_DATE
      ORDER BY br.due_date ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
  

  async getStatistics(startDate, endDate) {
    const query = `
      SELECT 
        COUNT(*) as total_borrowings,
        COUNT(CASE WHEN return_date IS NOT NULL THEN 1 END) as returned_books,
        COUNT(CASE WHEN return_date IS NULL THEN 1 END) as active_borrowings,
        COUNT(CASE WHEN return_date IS NULL AND due_date < CURRENT_DATE THEN 1 END) as overdue_books
      FROM borrowings
      WHERE checkout_date BETWEEN $1 AND $2
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows[0];
  }
  

  async hasActiveBorrowing(borrowerId, bookId) {
    const query = `
      SELECT id FROM borrowings 
      WHERE borrower_id = $1 AND book_id = $2 AND return_date IS NULL
    `;
    
    const result = await pool.query(query, [borrowerId, bookId]);
    return result.rows.length > 0;
  }
  

  async findHistoryByBorrowerId(borrowerId, options = {}) {
    const { page = 1, limit = 10, status = 'all' } = options;
    const offset = (page - 1) * limit;
    const conditions = ['br.borrower_id = $1'];
    const params = [borrowerId];
    let paramCount = 2;
    
    if (status === 'active') {
      conditions.push('br.return_date IS NULL');
    } else if (status === 'returned') {
      conditions.push('br.return_date IS NOT NULL');
    } else if (status === 'overdue') {
      conditions.push('br.return_date IS NULL AND br.due_date < CURRENT_DATE');
    }
    
    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    
    const query = `
      SELECT 
        br.id, br.checkout_date, br.due_date, br.return_date,
        br.extension_count, br.extension_reason, br.return_notes,
        b.id as book_id, b.title, b.author, b.isbn,
        brw.name as borrower_name, brw.email as borrower_email,
        CASE 
          WHEN br.return_date IS NULL AND br.due_date < CURRENT_DATE 
          THEN CURRENT_DATE - br.due_date 
          ELSE 0 
        END as days_overdue,
        CASE 
          WHEN br.return_date IS NOT NULL THEN 'returned'
          WHEN br.return_date IS NULL AND br.due_date < CURRENT_DATE THEN 'overdue'
          ELSE 'active'
        END as status
      FROM borrowings br
      JOIN books b ON br.book_id = b.id
      JOIN borrowers brw ON br.borrower_id = brw.id
      ${whereClause}
      ORDER BY br.checkout_date DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    const countQuery = `
      SELECT COUNT(*) 
      FROM borrowings br
      ${whereClause}
    `;
    
    params.push(limit, offset);
    
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    return {
      borrowings: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  

  async hasActiveBookBorrowings(bookId) {
    const query = `
      SELECT id FROM borrowings 
      WHERE book_id = $1 AND return_date IS NULL
    `;
    
    const result = await pool.query(query, [bookId]);
    return result.rows.length > 0;
  }


  async extendDueDate(borrowingId, newDueDate, extensionReason) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const borrowingResult = await client.query(
        'SELECT * FROM borrowings WHERE id = $1 AND return_date IS NULL FOR UPDATE',
        [borrowingId]
      );
      
      if (!borrowingResult.rows[0]) {
        throw new Error('Active borrowing not found');
      }
      
      const currentBorrowing = borrowingResult.rows[0];
      

      const updateResult = await client.query(
        `UPDATE borrowings 
         SET due_date = $2, 
             extension_count = COALESCE(extension_count, 0) + 1,
             extension_reason = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 
         RETURNING *`,
        [borrowingId, newDueDate, extensionReason]
      );
      
      await client.query('COMMIT');
      
      const detailsResult = await pool.query(`
        SELECT 
          br.*,
          b.title, b.author, b.isbn,
          brw.name as borrower_name, brw.email as borrower_email
        FROM borrowings br
        JOIN books b ON br.book_id = b.id
        JOIN borrowers brw ON br.borrower_id = brw.id
        WHERE br.id = $1
      `, [borrowingId]);
      
      return detailsResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = BorrowingRepository; 