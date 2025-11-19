const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const rateLimit = require('express-rate-limit'); // Disabled for app store release
const path = require('path');
// Load environment variables - prioritize system env vars over .env file
require('dotenv').config({ path: './config.env' });

const db = require('./database/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const journalRoutes = require('./routes/journal');
const diagnosisRoutes = require('./routes/diagnosis');
const blogRoutes = require('./routes/blogs');
const discoveryRoutes = require('./routes/discovery');
const reminderRoutes = require('./routes/reminders');
const feedbackRoutes = require('./routes/feedback');
const communityRoutes = require('./routes/community');
const micronutrientRoutes = require("./routes/micronutrient");
const diseaseActivityRoutes = require('./routes/diseaseActivity');
const nutritionTargetsRoutes = require('./routes/nutritionTargets');
const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3004;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Debug environment variables
console.log('🔍 Environment Variables Debug:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
console.log('DEBUG: CORS_ORIGINS from env:', process.env.CORS_ORIGINS);
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:19006', 'exp://localhost:19000', 'http://localhost:3004'];
console.log('DEBUG: Parsed CORS origins:', corsOrigins);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - DISABLED for app store release (scaling handled by Railway)
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests',
//     message: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);
  
  if (NODE_ENV === 'development') {
    console.log(`Request Body:`, req.body);
  }
  
  next();
});

// Health check endpoint for Railway
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await db.query('SELECT NOW() as current_time');
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      app: process.env.APP_NAME || 'IBDPal',
      version: process.env.APP_VERSION || '1.0.0',
      environment: NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      database_time: dbResult.rows[0].current_time
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      app: process.env.APP_NAME || 'IBDPal',
      version: process.env.APP_VERSION || '1.0.0',
      environment: NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await db.query('SELECT NOW() as current_time');
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      app: process.env.APP_NAME || 'IBDPal',
      version: process.env.APP_VERSION || '1.0.0',
      environment: NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      database_time: dbResult.rows[0].current_time
    });
  } catch (error) {
    console.error('API Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      app: process.env.APP_NAME || 'IBDPal',
      version: process.env.APP_VERSION || '1.0.0',
      environment: NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/community', communityRoutes);
app.use("/api/micronutrient", micronutrientRoutes);
app.use('/api/disease-activity', diseaseActivityRoutes);
app.use('/api/nutrition-targets', nutritionTargetsRoutes);
// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  const errorResponse = {
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  };

  if (NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(500).json(errorResponse);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 IBDPal server running on port ${PORT}`);
  console.log(`📱 App: ${process.env.APP_NAME || 'IBDPal'}`);
  console.log(`📦 Version: ${process.env.APP_VERSION || '1.0.0'}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 API Base URL: ${process.env.API_BASE_URL || `http://localhost:${PORT}/api`}`);
  console.log(`🔒 CORS Origins: ${corsOrigins.join(', ')}`);
  
  if (NODE_ENV === 'development') {
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  }
});

// Add error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
});

server.on('connection', (socket) => {
  console.log('New connection from:', socket.remoteAddress);
});

module.exports = app; 