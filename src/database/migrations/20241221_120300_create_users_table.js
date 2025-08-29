
const up = async (pool) => {
  await pool.query(`
    -- Users table for authentication (bonus feature)
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'librarian',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        
        -- Role constraint
        CONSTRAINT users_role_check CHECK (role IN ('admin', 'librarian'))
    );
  `);
  
  console.log('✅ Created users table for authentication');
};

const down = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS users CASCADE;');
  console.log('✅ Dropped users table');
};

module.exports = { up, down }; 