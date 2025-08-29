const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

class MigrationManager {
  constructor() {
    this.migrationsDir = path.join(__dirname, 'migrations');
  }

  /**
   * Initialize migration tracking table
   */
  async initializeMigrationTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await pool.query(query);
      console.log('✅ Migration tracking table initialized');
    } catch (error) {
      console.error('❌ Failed to initialize migration table:', error.message);
      throw error;
    }
  }

  /**
   * Get all executed migrations
   */
  async getExecutedMigrations() {
    try {
      const result = await pool.query(
        'SELECT version FROM schema_migrations ORDER BY version'
      );
      return result.rows.map(row => row.version);
    } catch (error) {
      console.error('❌ Failed to get executed migrations:', error.message);
      return [];
    }
  }

  /**
   * Get all available migration files
   */
  getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.js'))
        .sort();
      return files;
    } catch (error) {
      console.error('❌ Failed to read migration files:', error.message);
      return [];
    }
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations() {
    const executed = await this.getExecutedMigrations();
    const available = this.getMigrationFiles();
    
    return available.filter(file => {
      const version = file.replace('.js', '');
      return !executed.includes(version);
    });
  }

  /**
   * Load a migration file
   */
  loadMigration(filename) {
    try {
      const migrationPath = path.join(this.migrationsDir, filename);
      delete require.cache[require.resolve(migrationPath)];
      return require(migrationPath);
    } catch (error) {
      console.error(`❌ Failed to load migration ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Execute a single migration up
   */
  async executeMigrationUp(filename) {
    const version = filename.replace('.js', '');
    console.log(`🔄 Running migration: ${version}`);
    
    try {
      const migration = this.loadMigration(filename);
      
      if (typeof migration.up !== 'function') {
        throw new Error(`Migration ${filename} does not export an 'up' function`);
      }

      await migration.up(pool);
      
      await pool.query(
        'INSERT INTO schema_migrations (version) VALUES ($1)',
        [version]
      );
      
      console.log(`✅ Migration ${version} completed successfully`);
    } catch (error) {
      console.error(`❌ Migration ${version} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Execute a single migration down
   */
  async executeMigrationDown(filename) {
    const version = filename.replace('.js', '');
    console.log(`🔄 Rolling back migration: ${version}`);
    
    try {
      const migration = this.loadMigration(filename);
      
      if (typeof migration.down !== 'function') {
        throw new Error(`Migration ${filename} does not export a 'down' function`);
      }

      await migration.down(pool);
      
      await pool.query(
        'DELETE FROM schema_migrations WHERE version = $1',
        [version]
      );
      
      console.log(`✅ Migration ${version} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Rollback of ${version} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async migrate() {
    try {
      console.log('🚀 Starting database migration...');
      
      await this.initializeMigrationTable();
      const pending = await this.getPendingMigrations();
      
      if (pending.length === 0) {
        console.log('✅ No pending migrations found. Database is up to date.');
        return;
      }
      
      console.log(`📋 Found ${pending.length} pending migration(s):`);
      pending.forEach(file => console.log(`   - ${file.replace('.js', '')}`));
      
      for (const filename of pending) {
        await this.executeMigrationUp(filename);
      }
      
      console.log('✅ All migrations completed successfully');
      
    } catch (error) {
      console.error('❌ Migration process failed:', error.message);
      throw error;
    }
  }

  /**
   * Rollback the last migration
   */
  async rollback(steps = 1) {
    try {
      console.log(`🔄 Rolling back ${steps} migration(s)...`);
      
      const executed = await this.getExecutedMigrations();
      
      if (executed.length === 0) {
        console.log('✅ No migrations to rollback.');
        return;
      }
      
      const toRollback = executed.slice(-steps).reverse();
      
      console.log(`📋 Rolling back ${toRollback.length} migration(s):`);
      toRollback.forEach(version => console.log(`   - ${version}`));
      
      for (const version of toRollback) {
        await this.executeMigrationDown(`${version}.js`);
      }
      
      console.log('✅ Rollback completed successfully');
      
    } catch (error) {
      console.error('❌ Rollback process failed:', error.message);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async status() {
    try {
      console.log('📊 Migration Status:');
      console.log('==================');
      
      const executed = await this.getExecutedMigrations();
      const available = this.getMigrationFiles();
      const pending = await this.getPendingMigrations();
      
      console.log(`Total migrations: ${available.length}`);
      console.log(`Executed: ${executed.length}`);
      console.log(`Pending: ${pending.length}`);
      console.log('');
      
      if (executed.length > 0) {
        console.log('✅ Executed migrations:');
        executed.forEach(version => console.log(`   - ${version}`));
        console.log('');
      }
      
      if (pending.length > 0) {
        console.log('⏳ Pending migrations:');
        pending.forEach(file => console.log(`   - ${file.replace('.js', '')}`));
      }
      
    } catch (error) {
      console.error('❌ Failed to get migration status:', error.message);
      throw error;
    }
  }


  createMigration(name) {
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .replace('T', '_');
    
    const filename = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}.js`;
    const filepath = path.join(this.migrationsDir, filename);
    
    const template = `/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 */

const up = async (pool) => {
  await pool.query(\`
    CREATE TABLE example (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );
  \`);
};

const down = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS example;');
};

module.exports = { up, down };
`;

    try {
      fs.writeFileSync(filepath, template);
      console.log(`✅ Created migration file: ${filename}`);
      return filename;
    } catch (error) {
      console.error('❌ Failed to create migration file:', error.message);
      throw error;
    }
  }
}

module.exports = MigrationManager; 