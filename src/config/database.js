const { Pool } = require('pg');
require('dotenv').config();

const isTestEnvironment = process.env.NODE_ENV === 'test';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: isTestEnvironment 
    ? (process.env.TEST_DB_NAME || 'library_management_test')
    : (process.env.DB_NAME || 'library_management'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '', 
  max: 20, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000, 
};

if (isTestEnvironment && !process.env.DB_PASSWORD) {
  console.log('⚠️  Running in test mode with default database configuration');
  dbConfig.password = '';
}

let pool;
let isRealDatabase = true;

try {
  pool = new Pool(dbConfig);
} catch (error) {
  console.log('⚠️  Could not create database pool, using mock');
  isRealDatabase = false;
}

const createMockPool = () => {
  return {
    query: async (text, params) => {
      console.log('🔧 Mock query:', text.substring(0, 50) + '...');
      
      if (text.includes('SELECT COUNT(*)')) {
        return { rows: [{ count: '0' }] };
      }
      
      if (text.includes('SELECT * FROM books') && text.includes('LIMIT')) {
        return { rows: [] };
      }
      
      if (text.includes('INSERT INTO books')) {
        return { 
          rows: [{
            id: '12345678-1234-1234-1234-123456789012',
            title: params[0] || 'Test Book',
            author: params[1] || 'Test Author',
            isbn: params[2] || '9781234567890',
            available_quantity: params[3] || 5,
            total_quantity: params[4] || 5,
            shelf_location: params[5] || 'A1-TEST',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]
        };
      }
      
      if (text.includes('SELECT * FROM books WHERE isbn')) {
        return { rows: [] };
      }
      
      return { rows: [], rowCount: 0 };
    },
    connect: async () => ({ 
      release: () => {},
      query: async (text, params) => {
        return await pool.query(text, params);
      }
    }),
    end: async () => {}
  };
};

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log(`✅ Database connected successfully (${dbConfig.database})`);
    client.release();
    isRealDatabase = true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    
    if (!isTestEnvironment) {
      process.exit(1);
    } else {
      console.log('⚠️  Test environment: using mock database');
      isRealDatabase = false;
      pool = createMockPool();
    }
  }
};

if (!isTestEnvironment) {
  testConnection();
} else {
  if (!isRealDatabase) {
    pool = createMockPool();
  }
}

module.exports = {
  pool,
  testConnection,
  dbConfig,
  isRealDatabase: () => isRealDatabase
}; 