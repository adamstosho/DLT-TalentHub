require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');

// Set default environment
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Import utilities
const logger = require('./utils/logger');

// Import Swagger configuration
const { specs, swaggerUiOptions } = require('./swagger-config');

// Create Express app
const app = express();

// Middleware to check database connection
let isDatabaseConnected = false;

const checkDatabaseConnection = (req, res, next) => {
  if (!isDatabaseConnected) {
    return res.status(503).json({
      status: 'error',
      message: 'Database is not available. Please try again later.',
      code: 'DATABASE_UNAVAILABLE'
    });
  }
  next();
};

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL, 'https://dlt-hub.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 10,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS * 800000),
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

// Compression middleware
app.use(compression());

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'DLT TalentHub Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      connected: isDatabaseConnected,
      status: isDatabaseConnected ? 'connected' : 'disconnected'
    }
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Import and use routes
try {
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/users');
  const talentRoutes = require('./routes/talents');
  const recruiterRoutes = require('./routes/recruiters');
  const jobRoutes = require('./routes/jobs');
  const adminRoutes = require('./routes/admin');
  const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');

  app.use('/api/auth', checkDatabaseConnection, authRoutes);
  app.use('/api/users', checkDatabaseConnection, userRoutes);
  app.use('/api/talents', checkDatabaseConnection, talentRoutes);
  app.use('/api/recruiters', checkDatabaseConnection, recruiterRoutes);
  app.use('/api/jobs', checkDatabaseConnection, jobRoutes);
  app.use('/api/admin', checkDatabaseConnection, adminRoutes);
  app.use('/api/notifications', checkDatabaseConnection, notificationRoutes);
app.use('/api/messages', checkDatabaseConnection, messageRoutes);

  logger.info('All routes loaded successfully');
} catch (error) {
  logger.error('Error loading routes:', error); // ❗ Show full error
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler.errorHandler);

// Database connection
try {
  const connectDB = require('./config/database');
  connectDB().then((connected) => {
    isDatabaseConnected = connected;
    if (connected) {
      logger.info('Database connected successfully');
    } else {
      logger.warn('Server running without database connection');
    }
  }).catch((error) => {
    logger.warn('Database connection failed:', error.message);
    isDatabaseConnected = false;
  });
} catch (error) {
  logger.warn('Database connection failed:', error.message);
  isDatabaseConnected = false;
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 DLT TalentHub Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
