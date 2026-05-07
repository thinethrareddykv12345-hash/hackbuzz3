/**
 * TeamPulse AI - Express Application
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

// Route imports
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const projectRoutes = require('./routes/projectRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const peerReviewRoutes = require('./routes/peerReviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Middleware imports
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// DISABLE CACHING GLOBALLY
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: true, // Allow all origins in dev for easier debugging
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging Registration Attempts
app.use('/api/auth/register', (req, res, next) => {
  if (req.method === 'POST') {
    console.log('📝 Incoming Register Request:', { 
      name: req.body.name, 
      email: req.body.email,
      hasPassword: !!req.body.password 
    });
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: { success: false, message: 'Too many requests' },
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Passport
require('./config/passport');
app.use(passport.initialize());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TeamPulse AI server is running', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/peer-reviews', peerReviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
