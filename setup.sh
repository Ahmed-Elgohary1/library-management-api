#!/bin/bash

# Library Management System Setup Script
# This script sets up the entire library management system

set -e

echo "🚀 Setting up Library Management System..."

# Check if Docker and Docker Compose are installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker and Docker Compose found"
    
    # Copy environment file
    if [ ! -f .env ]; then
        echo "📋 Creating .env file from template..."
        cp env.example .env
        echo "⚠️  Please edit .env file with your configuration"
    fi
    
    # Start services with Docker Compose
    echo "🐳 Starting services with Docker Compose..."
    docker compose up -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Check if API is running
    if curl -f http://localhost:3000/health &> /dev/null; then
        echo "✅ API is running successfully!"
        echo "🌍 API available at: http://localhost:3000"
        echo "📖 Documentation: http://localhost:3000"
        echo "🔍 Health Check: http://localhost:3000/health"
        echo ""
        echo "🔑 Default admin credentials:"
        echo "   Username: admin"
        echo "   Password: admin123"
        echo ""
        echo "📊 Database: PostgreSQL running on localhost:5432"
        echo "🗃️  Database Name: library_management"
    else
        echo "❌ API failed to start. Check logs with: docker-compose logs api"
        exit 1
    fi
    
else
    echo "⚠️  Docker not found. Setting up manually..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL is not installed. Please install PostgreSQL 12+ first."
        exit 1
    fi
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        echo "📋 Creating .env file from template..."
        cp env.example .env
        echo "⚠️  Please edit .env file with your PostgreSQL configuration"
        echo "⚠️  Then run: npm run db:migrate && npm run db:seed && npm start"
    fi
    
    echo "✅ Manual setup complete!"
    echo "📝 Next steps:"
    echo "   1. Edit .env file with your database configuration"
    echo "   2. Create PostgreSQL database: CREATE DATABASE library_management;"
    echo "   3. Run migrations: npm run db:migrate"
    echo "   4. Seed sample data: npm run db:seed"
    echo "   5. Start the server: npm start"
fi

echo ""
echo "🎉 Library Management System setup complete!"
echo ""
echo "📚 Available endpoints:"
echo "   • Books: GET/POST/PUT/DELETE /api/books"
echo "   • Borrowers: GET/POST/PUT/DELETE /api/borrowers"
echo "   • Borrowings: GET/POST /api/borrowings"
echo "   • Analytics: GET /api/analytics"
echo "   • Authentication: POST /api/auth/login"
echo ""
echo "🧪 Run tests with: npm test"
echo "📖 View full documentation in README.md" 