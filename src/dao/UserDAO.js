const { pool } = require('../config/database');

class UserDAO {
  
  
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }
  
  
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  
  
  static async create({ username, passwordHash, role }) {
    const query = `
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, username, role, created_at
    `;
    
    const result = await pool.query(query, [username, passwordHash, role]);
    return result.rows[0];
  }
  
  
  static async updatePassword(userId, passwordHash) {
    const query = `
      UPDATE users 
      SET password_hash = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING id, username, role, created_at, updated_at
    `;
    
    const result = await pool.query(query, [userId, passwordHash]);
    return result.rows[0];
  }
  
  
  static async findAll({ page = 1, limit = 10, sortBy = 'username', sortOrder = 'ASC' }) {
    const offset = (page - 1) * limit;
    
    const allowedSortFields = ['username', 'role', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'username';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    const query = `
      SELECT id, username, role, created_at, updated_at
      FROM users
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM users';
    
    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  
  static async deleteById(userId) {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }
  
  
  static async usernameExists(username, excludeUserId = null) {
    let query = 'SELECT id FROM users WHERE username = $1';
    const params = [username];
    
    if (excludeUserId) {
      query += ' AND id != $2';
      params.push(excludeUserId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
  
  
  static async updateLastLogin(userId) {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }
}

module.exports = UserDAO; 