const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { swaggerUi, specs } = require('./config/swagger');

const bookRoutes = require('./routes/books');
const borrowerRoutes = require('./routes/borrowers');
const borrowingRoutes = require('./routes/borrowings');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Library Management System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Library Management API Documentation'
}));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Library Management System API',
    version: '1.0.0',
    documentation: {
      swagger: '/api-docs',
      books: '/api/books',
      borrowers: '/api/borrowers',
      borrowings: '/api/borrowings',
      analytics: '/api/analytics',
      authentication: '/api/auth'
    },
    features: [
      'Book management (CRUD)',
      'Borrower management (CRUD)',
      'Book checkout and return',
      'Overdue tracking',
      'Search functionality',
      'Analytics and reporting',
      'CSV/XLSX exports',
      'JWT authentication',
      'Rate limiting',
      'Input validation'
    ]
  });
});

app.use('/api/books', bookRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Request payload too large'
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('⚠️  Force shutdown after timeout');
    process.exit(1);
  }, 10000);
};

const startServer = async () => {
  try {
    await testConnection();
    
    const server = app.listen(PORT, () => {
      console.log('🚀 Library Management System API started');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    });
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; 