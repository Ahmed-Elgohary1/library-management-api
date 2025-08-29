/**
 * Migration: Create database functions and triggers
 * Created: 2024-12-21T12:06:00.000Z
 */

const up = async (pool) => {
  await pool.query(`
    -- Function to automatically update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    -- Triggers for updated_at
    CREATE TRIGGER update_books_updated_at 
        BEFORE UPDATE ON books 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
    CREATE TRIGGER update_borrowers_updated_at 
        BEFORE UPDATE ON borrowers 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
    CREATE TRIGGER update_borrowings_updated_at 
        BEFORE UPDATE ON borrowings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
  
  console.log('✅ Created database functions and triggers for automatic timestamp updates');
};

const down = async (pool) => {
  await pool.query(`
    -- Drop triggers
    DROP TRIGGER IF EXISTS update_books_updated_at ON books;
    DROP TRIGGER IF EXISTS update_borrowers_updated_at ON borrowers;
    DROP TRIGGER IF EXISTS update_borrowings_updated_at ON borrowings;
    
    -- Drop function
    DROP FUNCTION IF EXISTS update_updated_at_column();
  `);
  
  console.log('✅ Dropped database functions and triggers');
};

module.exports = { up, down }; 