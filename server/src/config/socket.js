/**
 * Socket.io Configuration
 */
const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // Join team room
    socket.on('join-team', (teamId) => {
      socket.join(`team-${teamId}`);
      logger.info(`Socket ${socket.id} joined team-${teamId}`);
    });

    // Join project room
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
    });

    // New contribution notification
    socket.on('new-contribution', (data) => {
      io.to(`project-${data.projectId}`).emit('contribution-added', data);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`project-${data.projectId}`).emit('user-typing', data);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
