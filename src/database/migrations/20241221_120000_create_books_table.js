/**
 * Migration: Create books table
 * Created: 2024-12-21T12:00:00.000Z
 */

const up = async (pool) => {
  await pool.query(`
    -- Books table
    CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(13) UNIQUE NOT NULL,
        available_quantity INTEGER NOT NULL DEFAULT 0,
        total_quantity INTEGER NOT NULL DEFAULT 0,
        shelf_location VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraints
        CONSTRAINT books_quantity_check CHECK (available_quantity >= 0),
        CONSTRAINT books_total_quantity_check CHECK (total_quantity >= 0),
        CONSTRAINT books_available_lte_total CHECK (available_quantity <= total_quantity)
    );
  `);
  
  console.log('✅ Created books table with constraints');
};

const down = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS books CASCADE;');
  console.log('✅ Dropped books table');
};

module.exports = { up, down }; 