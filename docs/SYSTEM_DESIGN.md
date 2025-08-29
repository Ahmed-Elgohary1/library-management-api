# System Design & Utilities Documentation

## 🏗️ System Architecture Overview

The Library Management System follows a **layered architecture pattern** with clear separation of concerns, implementing the **Repository Pattern** and **Dependency Injection** for maintainability and testability.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│  • Express.js Server                                       │
│  • Middleware (Auth, Validation, Rate Limiting)            │
│  • Swagger Documentation                                    │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                  Controller Layer                           │
│  • HTTP Request/Response Handling                          │
│  • Route Management                                         │
│  • Input Validation                                         │
│  • Error Handling                                           │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
│  • Business Logic Implementation                            │
│  • Data Orchestration                                       │
│  • Cross-Entity Operations                                  │
│  • Transaction Management                                   │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                 Repository Layer                            │
│  • Data Access Abstraction                                 │
│  • SQL Query Implementation                                 │
│  • Database Operations                                      │
│  • Interface-based Design                                   │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│  • PostgreSQL Database                                      │
│  • Connection Pooling                                       │
│  • Optimized Indexes                                        │
│  • Data Persistence                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack & Utilities

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime environment |
| **Framework** | Express.js | ^4.18.2 | Web application framework |
| **Database** | PostgreSQL | 15+ | Primary data store |
| **Language** | JavaScript | ES6+ | Programming language |

### Security & Authentication

| Library | Version | Purpose |
|---------|---------|---------|
| **helmet** | ^7.1.0 | Security headers middleware |
| **cors** | ^2.8.5 | Cross-origin resource sharing |
| **bcryptjs** | ^2.4.3 | Password hashing |
| **jsonwebtoken** | ^9.0.2 | JWT token generation/verification |
| **express-validator** | ^7.0.1 | Input validation and sanitization |
| **express-rate-limit** | ^7.1.5 | API rate limiting |

### Database & Data Management

| Library | Version | Purpose |
|---------|---------|---------|
| **pg** | ^8.11.3 | PostgreSQL client |
| **pg-pool** | ^3.6.1 | Connection pooling |

### Data Export & Analytics

| Library | Version | Purpose |
|---------|---------|---------|
| **csv-writer** | ^1.6.0 | CSV file generation |
| **exceljs** | ^4.4.0 | Excel file generation |

### Performance & Optimization

| Library | Version | Purpose |
|---------|---------|---------|
| **compression** | ^1.7.4 | Gzip response compression |
| **morgan** | ^1.10.0 | HTTP request logging |

### Documentation & Development

| Library | Version | Purpose |
|---------|---------|---------|
| **swagger-jsdoc** | ^6.2.8 | OpenAPI specification generation |
| **swagger-ui-express** | ^5.0.0 | Interactive API documentation |
| **nodemon** | ^3.0.2 | Development auto-restart |
| **jest** | ^29.7.0 | Testing framework |
| **supertest** | ^6.3.4 | API testing utilities |

### Configuration Management

| Library | Version | Purpose |
|---------|---------|---------|
| **dotenv** | ^16.3.1 | Environment variable management |

## 🎯 Design Patterns & Principles

### 1. Repository Pattern
- **Purpose**: Abstracts data access logic
- **Implementation**: Interface-based repositories with dependency injection
- **Benefits**: Testability, maintainability, database abstraction

### 2. Dependency Injection
- **Container**: Custom IoC container (`src/config/container.js`)
- **Scope**: Singleton pattern for shared instances
- **Benefits**: Loose coupling, easier testing, better modularity

### 3. Layered Architecture
- **Separation of Concerns**: Each layer has distinct responsibilities
- **Data Flow**: Unidirectional from controllers → services → repositories
- **Benefits**: Maintainability, scalability, testability

### 4. DTO Pattern
- **Purpose**: Data transfer objects for API communication
- **Implementation**: Structured data validation and transformation
- **Benefits**: Type safety, API contract enforcement

## 🔧 System Components

### Authentication System
- **JWT-based authentication** with configurable expiration
- **Role-based access control** (Admin, Librarian)
- **Password hashing** using bcrypt with salt rounds
- **Token refresh** mechanism

### Rate Limiting
- **Configurable limits** per endpoint
- **IP-based tracking** with sliding window
- **Graceful degradation** with meaningful error messages
- **Applied to**: Search endpoints and checkout operations

### Input Validation
- **Express-validator** for comprehensive input sanitization
- **SQL injection prevention** through parameterized queries
- **Data type validation** with custom rules
- **Email format validation** with regex patterns

### Error Handling
- **Global error handler** with environment-aware stack traces
- **Structured error responses** with success flags
- **HTTP status code mapping** for different error types
- **Graceful degradation** for database connection failures

### Performance Optimizations
- **Database connection pooling** (max 20 connections)
- **Strategic indexing** for common query patterns
- **Full-text search** using PostgreSQL GIN indexes
- **Response compression** with gzip
- **Pagination** for large result sets

## 🗄️ Database Design

### Schema Design Principles
1. **Normalized structure** to reduce redundancy
2. **Referential integrity** with foreign key constraints
3. **Performance optimization** through strategic indexing
4. **Data validation** at database level with constraints

### Key Tables
- **books**: Core book information with inventory tracking
- **borrowers**: User information with email validation
- **borrowings**: Transaction records with date tracking
- **users**: Authentication and authorization
- **analytics_cache**: Performance optimization for reports

### Indexing Strategy
- **Full-text search indexes** on book titles and authors
- **Composite indexes** for common query patterns
- **Partial indexes** for active borrowings and overdue books
- **Unique constraints** for business rules enforcement

## 🔄 Migration System

### Custom Migration Framework
- **Version-based migrations** with timestamp ordering
- **Rollback support** for safe schema changes
- **Status tracking** to prevent duplicate runs
- **CLI interface** for easy management

### Migration Commands
```bash
npm run migrate:up      # Apply pending migrations
npm run migrate:down    # Rollback last migration
npm run migrate:status  # Check migration status
npm run migrate:create  # Generate new migration
```

## 📊 Analytics & Reporting

### Background Processing
- **Asynchronous analytics** to avoid blocking main requests
- **Caching layer** for expensive aggregation queries
- **Scheduled jobs** for periodic data processing

### Export Capabilities
- **CSV exports** for spreadsheet compatibility
- **Excel exports** with formatted data
- **Configurable date ranges** for historical analysis
- **Real-time generation** with streaming for large datasets

## 🐳 Containerization

### Docker Architecture
- **Multi-service setup** with Docker Compose
- **PostgreSQL container** with persistent volumes
- **Redis container** for future caching enhancements
- **Health checks** for all services
- **Non-root user** for security

### Container Features
- **Automatic restart** policies
- **Volume mounting** for data persistence
- **Network isolation** with custom network
- **Environment-based configuration**

## 🔐 Security Features

### Input Security
- **Parameterized queries** prevent SQL injection
- **Input sanitization** removes malicious content
- **Length limits** prevent buffer overflow attacks
- **Type validation** ensures data integrity

### Authentication Security
- **JWT tokens** with configurable expiration
- **Password hashing** with bcrypt salt rounds
- **Role-based authorization** for protected endpoints
- **Token blacklisting** capability

### Network Security
- **CORS configuration** for cross-origin requests
- **Security headers** via Helmet middleware
- **Rate limiting** to prevent abuse
- **Request size limits** to prevent DoS attacks

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless design** enables multiple API instances
- **Database connection pooling** handles concurrent requests
- **Load balancer ready** architecture
- **Container orchestration** support

### Performance Scaling
- **Read optimization** through strategic indexing
- **Query optimization** with efficient SQL
- **Caching layer** for expensive operations
- **Pagination** for large datasets

### Future Enhancements
- **Redis integration** for session management
- **Message queues** for background processing
- **Microservices migration** path available
- **API versioning** support ready

## 🧪 Testing Strategy

### Test Architecture
- **Unit tests** for individual components
- **Integration tests** for API endpoints
- **Mock implementations** for external dependencies
- **Coverage reporting** with Jest

### Testing Utilities
- **Supertest** for HTTP endpoint testing
- **Mock database** for isolated unit tests
- **Dependency injection** enables easy mocking
- **Test environment** configuration

## 🔧 Development Utilities

### Development Tools
- **Nodemon** for automatic server restart
- **Morgan** for HTTP request logging
- **Environment-based configuration** for different stages
- **Hot reloading** during development

### Database Management
- **Migration CLI** for schema management
- **Seeding scripts** for test data
- **Schema validation** tools
- **Database rebuilding** utilities

## 🚀 Deployment Architecture

### Production Deployment
- **Docker-based deployment** for consistency
- **Environment variable configuration** for security
- **Health check endpoints** for monitoring
- **Graceful shutdown** handling

### Monitoring & Observability
- **Health check endpoints** for service monitoring
- **Request logging** with Morgan
- **Error tracking** with structured logging
- **Performance metrics** through database query logging

---

This system design prioritizes **maintainability**, **performance**, and **security** while providing a solid foundation for future enhancements and scaling requirements. 