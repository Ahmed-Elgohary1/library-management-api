const MigrationManager = require('./MigrationManager');


const migrate = async () => {
  console.log('⚠️  DEPRECATED: This migration method is deprecated.');
  console.log('🔄 Please use the new migration system:');
  console.log('   npm run migrate:up     - Run all pending migrations');
  console.log('   npm run migrate:down   - Rollback last migration');
  console.log('   npm run migrate:status - Show migration status');
  console.log('');
  console.log('🚀 Running new migration system...');
  
  const manager = new MigrationManager();
  
  try {
    await manager.migrate();
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  migrate();
}

module.exports = { migrate }; 