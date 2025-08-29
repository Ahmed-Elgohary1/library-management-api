# Installation & Running Guide

## 📋 Prerequisites

Before installing the Library Management System, ensure you have the following requirements:

### System Requirements
- **Operating System**: Linux, macOS, or Windows
- **Node.js**: Version 16.0.0 or higher
- **PostgreSQL**: Version 12 or higher (if running manually)
- **Docker & Docker Compose**: Latest version (recommended approach)

### Hardware Requirements
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: At least 1GB free space
- **CPU**: Any modern processor (x64 architecture)

## 🚀 Quick Start (Recommended)

### Option 1: Automated Setup Script

The fastest way to get started:

```bash
# Clone the repository
git clone https://github.com/Ahmed-Elgohary1/library-management-api.git
cd library-management-api

# Run the automated setup script
chmod +x setup.sh
./setup.sh
```

The script will:
- Detect if Docker is available and use it automatically
- Create environment configuration
- Start all services
- Verify the installation
- Provide you with access URLs and credentials

### Option 2: Docker Compose (Manual)

If you prefer manual control over the setup:

```bash
# 1. Clone and navigate
git clone https://github.com/Ahmed-Elgohary1/library-management-api.git
cd library-management-api

# 2. Create environment file
cp env.example .env
# Edit .env with your preferred settings (optional)

# 3. Start all services
docker compose up -d

# 4. Verify installation
curl http://localhost:3000/health
```

## 🔧 Manual Installation (Without Docker)

### Step 1: Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Ahmed-Elgohary1/library-management-api.git
cd library-management-api

# Install Node.js dependencies
npm install
```

### Step 2: Database Setup

#### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

#### Database Creation

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE DATABASE library_management;
CREATE USER library_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE library_management TO library_user;
\q
```

### Step 3: Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your database credentials
nano .env
```

**Required .env variables:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_management
DB_USER=library_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: Database Migration

```bash
# Run database migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### Step 5: Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## 🐳 Docker Configuration Details

### Services Overview

The Docker Compose setup includes:

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| **api** | 3000 | Main API server | `/health` endpoint |
| **postgres** | 5433 | PostgreSQL database | `pg_isready` command |
| **redis** | 6379 | Caching (optional) | `redis-cli ping` |

### Docker Environment Variables

The Docker setup uses these default environment variables:

```yaml
# API Service Environment
NODE_ENV: development
PORT: 3000
DB_HOST: postgres
DB_PORT: 5432
DB_NAME: library_management
DB_USER: postgres
DB_PASSWORD: library_password
JWT_SECRET: your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN: 24h
RATE_LIMIT_WINDOW_MS: 900000
RATE_LIMIT_MAX_REQUESTS: 100
```

### Volume Mounts

- **PostgreSQL Data**: Persistent storage for database files
- **Redis Data**: Persistent storage for cache data
- **Exports Directory**: Shared volume for generated reports

## 🔍 Verification & Testing

### Health Check

After installation, verify the system is running:

```bash
# Check API health
curl http://localhost:3000/health

# Expected response:
{
  "success": true,
  "message": "Library Management System API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Database Connection Test

```bash
# Test database connection
npm run db:status

# Check migration status
npm run migrate:status
```

### API Documentation

Access the interactive API documentation:
- **Swagger UI**: http://localhost:3000/api-docs
- **API Overview**: http://localhost:3000/

## 🧪 Running Tests

### Test Suite

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- test/book.test.js
```

### Test Environment

The system automatically uses a test database configuration when `NODE_ENV=test`:

```bash
# Set test environment
export NODE_ENV=test

# Run tests
npm test
```

## 🛠️ Development Setup

### Development Mode

```bash
# Start with auto-restart on file changes
npm run dev

# The server will restart automatically when you modify files
```

### Database Development

```bash
# Create a new migration
npm run migrate:create add_new_feature

# Apply migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Reset database (caution: destroys all data)
npm run db:fresh
```

## 🚀 Production Deployment

### Environment Preparation

1. **Set production environment variables:**
```bash
export NODE_ENV=production
export JWT_SECRET=your-actual-production-secret
export DB_PASSWORD=your-secure-production-password
```

2. **Install production dependencies:**
```bash
npm ci --only=production
```

3. **Run database migrations:**
```bash
npm run db:migrate
```

### Docker Production Deployment

```bash
# Build and start in production mode
docker compose -f docker-compose.yml up -d

# Scale API instances
docker compose up -d --scale api=3
```

### Manual Production Deployment

```bash
# Start the application
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start src/app.js --name "library-api"
pm2 startup
pm2 save
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL service status
sudo systemctl status postgresql

# Check if database exists
sudo -u postgres psql -l | grep library_management

# Test connection manually
psql -h localhost -U postgres -d library_management
```

#### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

#### Docker Issues
```bash
# Check container status
docker compose ps

# View container logs
docker compose logs api
docker compose logs postgres

# Restart services
docker compose restart
```

### Environment Issues

#### Missing Environment Variables
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.DB_HOST)"
```

#### Permission Issues (Linux/macOS)
```bash
# Fix file permissions
chmod +x setup.sh
chmod +x entrypoint.sh

# Fix directory permissions for exports
sudo chown -R $USER:$USER exports/
```

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# Check system health
curl http://localhost:3000/health

# Monitor database performance
npm run db:status
```

### Log Management

```bash
# View application logs (Docker)
docker compose logs -f api

# View PostgreSQL logs (Docker)
docker compose logs -f postgres

# Manual deployment logs
tail -f /var/log/library-api.log
```

### Database Maintenance

```bash
# Backup database
pg_dump -h localhost -U postgres library_management > backup.sql

# Restore database
psql -h localhost -U postgres library_management < backup.sql

# Analyze database performance
npm run db:analyze
```

## 🔄 Updates & Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Run any new migrations
npm run db:migrate

# Restart the application
npm restart
```

### Docker Updates

```bash
# Pull latest images
docker compose pull

# Rebuild and restart
docker compose up -d --build
```

## 📱 Default Access Information

### API Access
- **Base URL**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

### Database Access (Docker)
- **Host**: localhost
- **Port**: 5433 (mapped from container's 5432)
- **Database**: library_management
- **Username**: postgres
- **Password**: library_password

### Default User Credentials
- **Username**: admin
- **Password**: admin123
- **Role**: admin

## 🎯 Next Steps

After successful installation:

1. **Explore the API**: Visit http://localhost:3000/api-docs
2. **Test endpoints**: Use the provided Postman collection
3. **Add sample data**: Run `npm run db:seed`
4. **Read the API documentation**: Check the `/docs` directory
5. **Run tests**: Execute `npm test` to verify everything works

For any issues or questions, refer to the troubleshooting section above or check the project's issue tracker. 