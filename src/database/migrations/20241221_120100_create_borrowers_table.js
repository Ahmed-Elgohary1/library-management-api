
const up = async (pool) => {
  await pool.query(`
    -- Borrowers table
    CREATE TABLE IF NOT EXISTS borrowers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        registered_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Email validation constraint
        CONSTRAINT borrowers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
    );
  `);
  
  console.log('✅ Created borrowers table with email validation');
};

const down = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS borrowers CASCADE;');
  console.log('✅ Dropped borrowers table');
};

module.exports = { up, down }; 