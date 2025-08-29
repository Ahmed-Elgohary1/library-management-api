# Database Migrations

This project uses a robust database migration system that allows you to version control your database schema changes and easily rollback if needed.

## Migration System Overview

The migration system provides:
- **Individual migration files** for each database change
- **Up and down functionality** for applying and rolling back changes
- **Migration tracking** to know which migrations have been executed
- **CLI commands** for easy management
- **Rollback capability** to undo changes safely

## Migration Files Structure

```
src/database/
├── migrations/
│   ├── 20241221_120000_create_books_table.js
│   ├── 20241221_120100_create_borrowers_table.js
│   ├── 20241221_120200_create_borrowings_table.js
│   ├── 20241221_120300_create_users_table.js
│   ├── 20241221_120400_create_analytics_cache_table.js
│   ├── 20241221_120500_create_indexes.js
│   └── 20241221_120600_create_triggers_and_functions.js
├── MigrationManager.js
├── migrate-cli.js
└── migrate.js (deprecated)
```

## Available Commands

### Run Migrations
```bash
# Run all pending migrations
npm run migrate:up

# Alternative command
npm run migrate
```

### Rollback Migrations
```bash
# Rollback the last migration
npm run migrate:down

# Rollback the last 3 migrations
npm run migrate:down 3

# Alternative command
npm run migrate:rollback
```

### Check Migration Status
```bash
# Show which migrations have been executed and which are pending
npm run migrate:status
```

### Create New Migration
```bash
# Create a new migration file with a descriptive name
npm run migrate:create "add user preferences table"

# This will create a file like: 20241221_130000_add_user_preferences_table.js
```

## Migration File Format

Each migration file exports two functions: `up` and `down`.

```javascript
/**
 * Migration: Add user preferences table
 * Created: 2024-12-21T13:00:00.000Z
 */

const up = async (pool) => {
  await pool.query(`
    CREATE TABLE user_preferences (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      theme VARCHAR(20) DEFAULT 'light',
      notifications BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('✅ Created user_preferences table');
};

const down = async (pool) => {
  await pool.query('DROP TABLE IF EXISTS user_preferences CASCADE;');
  console.log('✅ Dropped user_preferences table');
};

module.exports = { up, down };
```

## Current Migrations

### 1. Create Books Table (20241221_120000)
- Creates the `books` table with all constraints
- Includes quantity validation and ISBN uniqueness

### 2. Create Borrowers Table (20241221_120100)
- Creates the `borrowers` table
- Includes email validation constraint

### 3. Create Borrowings Table (20241221_120200)
- Creates the `borrowings` table with foreign keys
- Includes date validation constraints

### 4. Create Users Table (20241221_120300)
- Creates the `users` table for authentication
- Includes role validation constraints

### 5. Create Analytics Cache Table (20241221_120400)
- Creates the `analytics_cache` table for performance
- Includes unique constraints for caching

### 6. Create Indexes (20241221_120500)
- Creates all database indexes for optimal read performance
- Includes full-text search indexes and composite indexes

### 7. Create Triggers and Functions (20241221_120600)
- Creates the `update_updated_at_column()` function
- Creates triggers for automatic timestamp updates

## Migration Tracking

The system uses a `schema_migrations` table to track which migrations have been executed:

```sql
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Best Practices

### 1. Naming Conventions
- Use descriptive names for migrations
- Follow the format: `YYYYMMDD_HHMMSS_description`
- Use underscores instead of spaces

### 2. Migration Content
- Keep migrations atomic (one logical change per migration)
- Always provide both `up` and `down` functions
- Test your rollback (`down`) function
- Use `IF NOT EXISTS` and `IF EXISTS` for safety

### 3. Rollback Safety
- Ensure your `down` function can safely undo the `up` function
- Be careful with data-destructive operations
- Consider data migration strategies for complex changes

### 4. Dependencies
- Migrations run in chronological order
- Ensure later migrations don't depend on rolled-back changes
- Use foreign key constraints appropriately

## Examples

### Creating a New Migration
```bash
# Create a migration for adding a new column
npm run migrate:create "add phone number to borrowers"

# Edit the generated file
# src/database/migrations/20241221_140000_add_phone_number_to_borrowers.js
```

### Migration File Example
```javascript
const up = async (pool) => {
  await pool.query(`
    ALTER TABLE borrowers 
    ADD COLUMN phone_number VARCHAR(20);
  `);
  console.log('✅ Added phone_number column to borrowers table');
};

const down = async (pool) => {
  await pool.query(`
    ALTER TABLE borrowers 
    DROP COLUMN IF EXISTS phone_number;
  `);
  console.log('✅ Removed phone_number column from borrowers table');
};

module.exports = { up, down };
```

### Running the Migration
```bash
# Check status
npm run migrate:status

# Run the migration
npm run migrate:up

# If needed, rollback
npm run migrate:down
```

## Troubleshooting

### Migration Fails
1. Check the error message carefully
2. Verify your SQL syntax
3. Ensure dependencies are met (tables exist, etc.)
4. Check database connection

### Rollback Fails
1. Verify your `down` function is correct
2. Check for dependent objects (foreign keys, indexes)
3. Use `CASCADE` options when appropriate

### Migration Out of Sync
1. Use `npm run migrate:status` to check current state
2. Manually fix the `schema_migrations` table if needed
3. Re-run migrations as required

## Legacy Migration Support

The old `migrate.js` file is still supported for backward compatibility but is deprecated. It now uses the new migration system under the hood.

```bash
# Still works but shows deprecation warning
npm run db:migrate
```

## Development Workflow

1. **Make schema changes**: Create a new migration file
2. **Test locally**: Run the migration and test your application
3. **Test rollback**: Ensure you can roll back the changes
4. **Commit**: Add the migration file to version control
5. **Deploy**: Run migrations on staging/production environments

This migration system provides a robust foundation for managing database schema changes throughout the application lifecycle. 