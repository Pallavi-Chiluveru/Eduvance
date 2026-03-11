require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { verifyCsrfToken } = require('./middleware/csrf');

// ────────────────────────────────────────────
// Initialize Express App
// ────────────────────────────────────────────
const app = express();

// ────────────────────────────────────────────
// Security Middleware
// ────────────────────────────────────────────
app.use(helmet());

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests, try again later.' },
});
app.use('/api/', limiter);

// ────────────────────────────────────────────
// Body Parsers & CORS
// ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim().replace(/\/$/, ''));

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            
            const sanitizedOrigin = origin.replace(/\/$/, '');
            
            // Check if origin is in allowed list or is a Vercel preview URL
            const isAllowed = corsOrigins.includes(sanitizedOrigin) || 
                             (process.env.NODE_ENV === 'production' && sanitizedOrigin.endsWith('.vercel.app'));

            if (isAllowed) {
                callback(null, true);
            } else {
                console.warn(`❌ CORS blocked for origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    })
);

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ────────────────────────────────────────────
// CSRF Protection (all state-changing API requests)
// ────────────────────────────────────────────
app.use('/api/', verifyCsrfToken);

// ────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'DLSES API Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error handler (must be last)
app.use(errorHandler);

// ────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
        console.log(`📡 API: http://localhost:${PORT}/api`);
        console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    });
};

startServer();

module.exports = app;
