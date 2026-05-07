/**
 * TeamPulse AI - Server Entry Point
 * Initializes Express + Socket.io
 */
require('dotenv').config();
require('express-async-errors');

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = http.createServer(app);

  // Initialize Socket.io
  initSocket(server);

  server.listen(PORT, () => {
    logger.info(`🚀 TeamPulse AI server running on port ${PORT}`);
    logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
