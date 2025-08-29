#!/usr/bin/env node

const MigrationManager = require('./MigrationManager');

const manager = new MigrationManager();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'up':
      case 'migrate':
        await manager.migrate();
        break;
        
      case 'down':
      case 'rollback':
        const steps = parseInt(args[1]) || 1;
        await manager.rollback(steps);
        break;
        
      case 'status':
        await manager.status();
        break;
        
      case 'create':
        const name = args.slice(1).join(' ');
        if (!name) {
          console.error('❌ Please provide a migration name');
          console.log('Usage: npm run migrate:create "migration name"');
          process.exit(1);
        }
        manager.createMigration(name);
        break;
        
      default:
        console.log('📚 Migration CLI Usage:');
        console.log('=====================');
        console.log('npm run migrate:up     - Run all pending migrations');
        console.log('npm run migrate:down   - Rollback last migration');
        console.log('npm run migrate:down 3 - Rollback last 3 migrations');
        console.log('npm run migrate:status - Show migration status');
        console.log('npm run migrate:create "migration name" - Create new migration');
        console.log('');
        console.log('Available commands:');
        console.log('  up, migrate  - Run pending migrations');
        console.log('  down, rollback [steps] - Rollback migrations');
        console.log('  status       - Show migration status');
        console.log('  create <name> - Create new migration file');
        break;
    }
  } catch (error) {
    console.error('❌ Migration command failed:', error.message);
    process.exit(1);
  } finally {
    const { pool } = require('../config/database');
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 