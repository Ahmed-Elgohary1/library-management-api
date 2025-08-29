
const up = async (pool) => {
  await pool.query(`
    -- Add last_login column to users table if it doesn't exist
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
  `);
  
  console.log('✅ Added last_login column to users table');
};

const down = async (pool) => {
  await pool.query(`
    -- Remove last_login column from users table
    ALTER TABLE users 
    DROP COLUMN IF EXISTS last_login;
  `);
  console.log('✅ Removed last_login column from users table');
};

module.exports = { up, down }; 