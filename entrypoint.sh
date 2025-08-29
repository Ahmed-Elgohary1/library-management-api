#!/bin/sh

# Library Management System Docker Entrypoint
# Handles application startup and database setup

set -e

echo "🚀 Starting Library Management System..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432}; do
    echo "🔄 Waiting for PostgreSQL at ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
    sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "🗃️ Running database migrations..."
if [ -f "src/database/migrate.js" ]; then
    node src/database/migrate.js || echo "⚠️ Migration failed or already applied"
fi

# Seed database with sample data (only in development)
if [ "${NODE_ENV}" != "production" ]; then
    echo "🌱 Seeding database with sample data..."
    if [ -f "src/database/seed.js" ]; then
        node src/database/seed.js || echo "⚠️ Seeding failed or already applied"
    fi
fi

echo "🎉 Setup complete! Starting application..."

# Start the application
exec "$@" 