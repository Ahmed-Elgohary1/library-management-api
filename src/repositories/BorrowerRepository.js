const { pool } = require('../config/database');
const IBorrowerRepository = require('./IBorrowerRepository');


class BorrowerRepository extends IBorrowerRepository {
  

  async create({ name, email, registered_date }) {
    const query = `
      INSERT INTO borrowers (name, email, registered_date)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, 
      email, 
      registered_date || new Date().toISOString().split('T')[0]
    ]);
    
    return result.rows[0];
  }
  

  async findById(id) {
    const query = 'SELECT * FROM borrowers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  

  async findByEmail(email) {
    const query = 'SELECT * FROM borrowers WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }
  

  async findAll({ search, page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 1;
    
    if (search) {
      conditions.push(`(name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const allowedSortFields = ['name', 'email', 'registered_date', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    const query = `
      SELECT * FROM borrowers
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    const countQuery = `
      SELECT COUNT(*) FROM borrowers
      ${whereClause}
    `;
    
    params.push(limit, offset);
    
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    return {
      borrowers: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  

  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      return null;
    }
    
    values.push(id);
    const query = `
      UPDATE borrowers 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
  

  async delete(id) {
    const query = 'DELETE FROM borrowers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
  

  async getCurrentBooks(borrowerId) {
    const query = `
      SELECT 
        b.id, b.title, b.author, b.isbn,
        br.id as borrowing_id, br.checkout_date, br.due_date
      FROM borrowings br
      JOIN books b ON br.book_id = b.id
      WHERE br.borrower_id = $1 AND br.return_date IS NULL
      ORDER BY br.checkout_date DESC
    `;
    
    const result = await pool.query(query, [borrowerId]);
    return result.rows;
  }
  

  async getOverdueBooks(borrowerId) {
    const query = `
      SELECT 
        b.id, b.title, b.author, b.isbn,
        br.id as borrowing_id, br.checkout_date, br.due_date,
        CURRENT_DATE - br.due_date as days_overdue
      FROM borrowings br
      JOIN books b ON br.book_id = b.id
      WHERE br.borrower_id = $1 
        AND br.return_date IS NULL 
        AND br.due_date < CURRENT_DATE
      ORDER BY br.due_date ASC
    `;
    
    const result = await pool.query(query, [borrowerId]);
    return result.rows;
  }
  

  async findWithOverdueBooks() {
    const query = `
      SELECT DISTINCT
        br.id, br.name, br.email,
        COUNT(b.id) as overdue_count
      FROM borrowers br
      JOIN borrowings bg ON br.id = bg.borrower_id
      JOIN books b ON bg.book_id = b.id
      WHERE bg.return_date IS NULL AND bg.due_date < CURRENT_DATE
      GROUP BY br.id, br.name, br.email
      ORDER BY overdue_count DESC, br.name ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
  

  async emailExists(email, excludeId = null) {
    let query = 'SELECT id FROM borrowers WHERE email = $1';
    const params = [email];
    
    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
  

  async getBorrowingHistory(borrowerId, { page = 1, limit = 10, status = 'all' } = {}) {
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
}

module.exports = BorrowerRepository; 