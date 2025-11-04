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
    if (process.env.DISABLE_WEBSOCKET === 'true') {
      console.log('🔌 WebSocket disabled');
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
        });

        socket.on('join-user', (userId) => {
          socket.join(`user:${userId}`);
        });

        socket.on('disconnect', () => {
          console.log('❌ WebSocket disconnected:', socket.id);
        });
      });

      console.log('✅ WebSocket server initialized');
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  }

  sendNotificationToUser(userId, notification) {
    if (!this.io) return;
    
    try {
      this.io.to(`user:${userId}`).emit('notification', notification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  sendNotificationToCompany(companyId, notification) {
    if (!this.io) return;
    
    try {
      this.io.to(`company:${companyId}`).emit('notification', notification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  broadcastToCompany(companyId, event, data) {
    if (!this.io) return;
    
    try {
      this.io.to(`company:${companyId}`).emit(event, data);
    } catch (error) {
      console.error('Error broadcasting:', error);
    }
  }
}

const wsServer = new WebSocketServer();
module.exports = { wsServer };
