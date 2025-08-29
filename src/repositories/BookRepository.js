const { pool } = require('../config/database');
const IBookRepository = require('./IBookRepository');


class BookRepository extends IBookRepository {
  

  async create({ title, author, isbn, available_quantity, total_quantity, shelf_location }) {
    const query = `
      INSERT INTO books (title, author, isbn, available_quantity, total_quantity, shelf_location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, 
      author, 
      isbn, 
      available_quantity || 0, 
      total_quantity || available_quantity || 0, 
      shelf_location
    ]);
    
    return result.rows[0];
  }
  

  async findById(id) {
    const query = 'SELECT * FROM books WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  

  async findByISBN(isbn) {
    const query = 'SELECT * FROM books WHERE isbn = $1';
    const result = await pool.query(query, [isbn]);
    return result.rows[0] || null;
  }
  

  async findAll({ page = 1, limit = 10, sortBy = 'title', sortOrder = 'ASC' }) {
    const offset = (page - 1) * limit;
    
    const allowedSortFields = ['title', 'author', 'isbn', 'created_at', 'available_quantity'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'title';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    const query = `
      SELECT * FROM books
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM books';
    
    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    return {
      books: result.rows,
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
      UPDATE books 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
  

  async delete(id) {
    const query = 'DELETE FROM books WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
  

  async deleteByISBN(isbn) {
    const query = 'DELETE FROM books WHERE isbn = $1';
    const result = await pool.query(query, [isbn]);
    return result.rowCount > 0;
  }
  

  async search({ search, author, page = 1, limit = 10, sortBy = 'title', sortOrder = 'ASC' }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 1;
    
    if (search) {
      conditions.push(`(
        title ILIKE $${paramCount} OR 
        author ILIKE $${paramCount} OR 
        isbn ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (author) {
      conditions.push(`author ILIKE $${paramCount}`);
      params.push(`%${author}%`);
      paramCount++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const allowedSortFields = ['title', 'author', 'isbn', 'created_at', 'available_quantity'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'title';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    const query = `
      SELECT * FROM books
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    const countQuery = `
      SELECT COUNT(*) FROM books
      ${whereClause}
    `;
    
    params.push(limit, offset);
    
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    return {
      books: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  

  async updateAvailability(bookId, quantityChange) {
    const query = `
      UPDATE books 
      SET available_quantity = available_quantity + $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND available_quantity + $2 >= 0
      RETURNING *
    `;
    
    const result = await pool.query(query, [bookId, quantityChange]);
    return result.rows[0] || null;
  }
  

  async findLowAvailability(threshold = 2) {
    const query = `
      SELECT * FROM books 
      WHERE available_quantity <= $1 AND available_quantity > 0
      ORDER BY available_quantity ASC, title ASC
    `;
    
    const result = await pool.query(query, [threshold]);
    return result.rows;
  }
  

  async isbnExists(isbn, excludeId = null) {
    let query = 'SELECT id FROM books WHERE isbn = $1';
    const params = [isbn];
    
    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
}

module.exports = BookRepository; 