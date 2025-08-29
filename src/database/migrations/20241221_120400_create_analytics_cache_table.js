/**
 * Migration: Create analytics cache table
 * Created: 2024-12-21T12:04:00.000Z
 */

const up = async (pool) => {
  await pool.query(`
    -- Analytics cache table for performance (bonus feature)
    CREATE TABLE IF NOT EXISTS analytics_cache (
        id SERIAL PRIMARY KEY,
        report_type VARCHAR(50) NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Unique constraint for caching
        UNIQUE(report_type, period_start, period_end)
    );
  `);
  
  console.log('✅ Created analytics_cache table for performance optimization');
};

const down = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS analytics_cache CASCADE;');
  console.log('✅ Dropped analytics_cache table');
};

module.exports = { up, down }; 