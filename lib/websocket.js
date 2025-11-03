const { Server: SocketIOServer } = require('socket.io');
const { parse } = require('cookie');
const { prisma } = require('./prisma');

class WebSocketServer {
  constructor() {
    this.io = null;
    this.userSockets = new Map();
    this.companySockets = new Map();
  }

  initialize(httpServer) {
    // Option to disable WebSocket if needed
    if (process.env.DISABLE_WEBSOCKET === 'true' || process.env.RAILWAY_ENVIRONMENT === 'production') {
      console.log('🔌 WebSocket disabled in production');
      return;
    }

    try {
      console.log('🔌 Initializing WebSocket server...');
      
      this.io = new SocketIOServer(httpServer, {
        cors: {
          origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
          credentials: true,
        },
        path: '/socket.io',
        transports: ['polling', 'websocket'],
      });

      this.io.on('connection', (socket) => {
        console.log('✅ New WebSocket connection:', socket.id);
        
        socket.on('join-company', (companyId) => {
          socket.join(`company:${companyId}`);
          console.log(`Socket ${socket.id} joined company:${companyId}`);
        });

        socket.on('join-user', (userId) => {
          socket.join(`user:${userId}`);
          console.log(`Socket ${socket.id} joined user:${userId}`);
        });

        socket.on('disconnect', () => {
          console.log('❌ WebSocket disconnected:', socket.id);
        });
      });

      console.log('✅ WebSocket server initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  }

  sendNotificationToUser(userId, notification) {
    if (!this.io) {
      console.log('WebSocket not initialized, skipping notification');
      return;
    }
    
    try {
      this.io.to(`user:${userId}`).emit('notification', notification);
      console.log(`Notification sent to user:${userId}`);
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }

  sendNotificationToCompany(companyId, notification) {
    if (!this.io) {
      console.log('WebSocket not initialized, skipping notification');
      return;
    }
    
    try {
      this.io.to(`company:${companyId}`).emit('notification', notification);
      console.log(`Notification sent to company:${companyId}`);
    } catch (error) {
      console.error('Error sending notification to company:', error);
    }
  }

  broadcastToCompany(companyId, event, data) {
    if (!this.io) {
      console.log('WebSocket not initialized, skipping broadcast');
      return;
    }
    
    try {
      this.io.to(`company:${companyId}`).emit(event, data);
      console.log(`Event ${event} broadcast to company:${companyId}`);
    } catch (error) {
      console.error('Error broadcasting to company:', error);
    }
  }
}

const wsServer = new WebSocketServer();

module.exports = { wsServer };
