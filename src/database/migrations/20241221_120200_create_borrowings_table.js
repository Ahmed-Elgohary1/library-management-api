
const up = async (pool) => {
  await pool.query(`
    -- Borrowings table
    CREATE TABLE IF NOT EXISTS borrowings (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        borrower_id INTEGER NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
        checkout_date DATE NOT NULL DEFAULT CURRENT_DATE,
        due_date DATE NOT NULL,
        return_date DATE,
        is_returned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraints
        CONSTRAINT borrowings_due_date_check CHECK (due_date >= checkout_date),
        CONSTRAINT borrowings_return_date_check CHECK (return_date IS NULL OR return_date >= checkout_date)
    );
  `);
  
  console.log('✅ Created borrowings table with foreign keys and constraints');
};

const down = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS borrowings CASCADE;');
  console.log('✅ Dropped borrowings table');
};

module.exports = { up, down }; 