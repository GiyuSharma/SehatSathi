/**
 * Sehat Sathi Backend Server
 * Express.js server for AI-powered health assistant API
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const env = require('./config/env');

// Initialize Firebase (this will be called when firebaseConfig is imported)
require('./config/firebaseConfig');

// Import routes
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: env.corsOrigin,
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sehat Sathi API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/emergency', emergencyRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Sehat Sathi API',
        endpoints: {
            health: '/health',
            user: '/api/user',
            health: '/api/health',
            emergency: '/api/emergency'
        },
        documentation: 'See README.md for API documentation'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(env.nodeEnv === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = env.port;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   Sehat Sathi Backend API Server      ║
╚════════════════════════════════════════╝
    
✅ Server running on port ${PORT}
✅ Environment: ${env.nodeEnv}
✅ CORS enabled for: ${env.corsOrigin}

📡 Available endpoints:
   - GET  /health              - Health check
   - GET  /api/user/*          - User routes
   - POST /api/health/*        - Health analysis routes
   - POST /api/emergency/*     - Emergency routes

🔗 API Base URL: http://localhost:${PORT}
    `);
});

module.exports = app;

