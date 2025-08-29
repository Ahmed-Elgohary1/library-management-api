/**
 * Migration: Create database indexes for optimal read performance
 * Created: 2024-12-21T12:05:00.000Z
 */

const up = async (pool) => {
  await pool.query(`
    -- Books indexes
    CREATE INDEX IF NOT EXISTS idx_books_title ON books USING GIN (to_tsvector('english', title));
    CREATE INDEX IF NOT EXISTS idx_books_author ON books USING GIN (to_tsvector('english', author));
    CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
    CREATE INDEX IF NOT EXISTS idx_books_available_quantity ON books(available_quantity) WHERE available_quantity > 0;
    
    -- Borrowers indexes
    CREATE INDEX IF NOT EXISTS idx_borrowers_email ON borrowers(email);
    CREATE INDEX IF NOT EXISTS idx_borrowers_name ON borrowers USING GIN (to_tsvector('english', name));
    
    -- Borrowings indexes
    CREATE INDEX IF NOT EXISTS idx_borrowings_book_id ON borrowings(book_id);
    CREATE INDEX IF NOT EXISTS idx_borrowings_borrower_id ON borrowings(borrower_id);
    CREATE INDEX IF NOT EXISTS idx_borrowings_due_date ON borrowings(due_date);
    CREATE INDEX IF NOT EXISTS idx_borrowings_is_returned ON borrowings(is_returned);
    CREATE INDEX IF NOT EXISTS idx_borrowings_checkout_date ON borrowings(checkout_date);
    CREATE INDEX IF NOT EXISTS idx_borrowings_overdue ON borrowings(due_date, is_returned) WHERE is_returned = FALSE;
    
    -- Composite indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_borrowings_borrower_active ON borrowings(borrower_id, is_returned) WHERE is_returned = FALSE;
    CREATE INDEX IF NOT EXISTS idx_borrowings_book_active ON borrowings(book_id, is_returned) WHERE is_returned = FALSE;
    
    -- Users indexes
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    
    -- Analytics cache indexes
    CREATE INDEX IF NOT EXISTS idx_analytics_cache_type_period ON analytics_cache(report_type, period_start, period_end);
  `);
  
  console.log('✅ Created all database indexes for optimal read performance');
};

const down = async (pool) => {
  await pool.query(`
    -- Drop all indexes
    DROP INDEX IF EXISTS idx_books_title;
    DROP INDEX IF EXISTS idx_books_author;
    DROP INDEX IF EXISTS idx_books_isbn;
    DROP INDEX IF EXISTS idx_books_available_quantity;
    DROP INDEX IF EXISTS idx_borrowers_email;
    DROP INDEX IF EXISTS idx_borrowers_name;
    DROP INDEX IF EXISTS idx_borrowings_book_id;
    DROP INDEX IF EXISTS idx_borrowings_borrower_id;
    DROP INDEX IF EXISTS idx_borrowings_due_date;
    DROP INDEX IF EXISTS idx_borrowings_is_returned;
    DROP INDEX IF EXISTS idx_borrowings_checkout_date;
    DROP INDEX IF EXISTS idx_borrowings_overdue;
    DROP INDEX IF EXISTS idx_borrowings_borrower_active;
    DROP INDEX IF EXISTS idx_borrowings_book_active;
    DROP INDEX IF EXISTS idx_users_username;
    DROP INDEX IF EXISTS idx_analytics_cache_type_period;
  `);
  
  console.log('✅ Dropped all database indexes');
};

module.exports = { up, down }; 