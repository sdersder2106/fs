import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { parse } from 'cookie';
import { decode } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  companyId?: string;
  role?: string;
}

interface NotificationPayload {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'finding' | 'pentest' | 'report' | 'comment';
  title: string;
  message: string;
  link?: string;
  metadata?: any;
  createdAt: Date;
  read?: boolean;
}

class WebSocketServer {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private companySockets: Map<string, Set<string>> = new Map(); // companyId -> Set of socketIds

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        credentials: true,
      },
      path: '/socket.io',
    });

    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        // Extract and verify JWT token from cookies
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
          return next(new Error('Authentication required'));
        }

        const parsedCookies = parse(cookies);
        const sessionToken = parsedCookies['next-auth.session-token'] || 
                           parsedCookies['__Secure-next-auth.session-token'];

        if (!sessionToken) {
          return next(new Error('Session token not found'));
        }

        // Decode JWT token
        const decoded = await decode({
          token: sessionToken,
          secret: process.env.NEXTAUTH_SECRET!,
        }) as any;

        if (!decoded || !decoded.sub) {
          return next(new Error('Invalid session'));
        }

        // Get user details from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.sub },
          select: {
            id: true,
            companyId: true,
            role: true,
            fullName: true,
          },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        // Attach user info to socket
        socket.userId = user.id;
        socket.companyId = user.companyId;
        socket.role = user.role;

        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.userId} (Company: ${socket.companyId})`);

      // Track user socket
      if (socket.userId) {
        if (!this.userSockets.has(socket.userId)) {
          this.userSockets.set(socket.userId, new Set());
        }
        this.userSockets.get(socket.userId)!.add(socket.id);
      }

      // Track company socket
      if (socket.companyId) {
        if (!this.companySockets.has(socket.companyId)) {
          this.companySockets.set(socket.companyId, new Set());
        }
        this.companySockets.get(socket.companyId)!.add(socket.id);

        // Join company room
        socket.join(`company:${socket.companyId}`);
      }

      // Join user's personal room
      socket.join(`user:${socket.userId}`);

      // Handle subscription to specific entities
      socket.on('subscribe', async (data: { type: string; id: string }) => {
        try {
          // Verify user has access to this entity
          const hasAccess = await verifyEntityAccess(
            socket.userId!,
            socket.companyId!,
            data.type,
            data.id
          );

          if (hasAccess) {
            socket.join(`${data.type}:${data.id}`);
            socket.emit('subscribed', { type: data.type, id: data.id });
          } else {
            socket.emit('error', { message: 'Access denied' });
          }
        } catch (error) {
          console.error('Subscribe error:', error);
          socket.emit('error', { message: 'Subscription failed' });
        }
      });

      // Handle unsubscribe
      socket.on('unsubscribe', (data: { type: string; id: string }) => {
        socket.leave(`${data.type}:${data.id}`);
        socket.emit('unsubscribed', { type: data.type, id: data.id });
      });

      // Mark notification as read
      socket.on('markAsRead', async (notificationId: string) => {
        try {
          await prisma.notification.update({
            where: {
              id: notificationId,
              userId: socket.userId,
            },
            data: {
              read: true,
              readAt: new Date(),
            },
          });

          socket.emit('notificationRead', { id: notificationId });
        } catch (error) {
          console.error('Mark as read error:', error);
        }
      });

      // Mark all notifications as read
      socket.on('markAllAsRead', async () => {
        try {
          await prisma.notification.updateMany({
            where: {
              userId: socket.userId,
              read: false,
            },
            data: {
              read: true,
              readAt: new Date(),
            },
          });

          socket.emit('allNotificationsRead');
        } catch (error) {
          console.error('Mark all as read error:', error);
        }
      });

      // Get unread count
      socket.on('getUnreadCount', async () => {
        try {
          const count = await prisma.notification.count({
            where: {
              userId: socket.userId,
              read: false,
            },
          });

          socket.emit('unreadCount', count);
        } catch (error) {
          console.error('Get unread count error:', error);
        }
      });

      // Handle typing indicators for comments
      socket.on('typing', (data: { entityType: string; entityId: string; isTyping: boolean }) => {
        socket.to(`${data.entityType}:${data.entityId}`).emit('userTyping', {
          userId: socket.userId,
          entityType: data.entityType,
          entityId: data.entityId,
          isTyping: data.isTyping,
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);

        // Remove from user sockets
        if (socket.userId && this.userSockets.has(socket.userId)) {
          this.userSockets.get(socket.userId)!.delete(socket.id);
          if (this.userSockets.get(socket.userId)!.size === 0) {
            this.userSockets.delete(socket.userId);
          }
        }

        // Remove from company sockets
        if (socket.companyId && this.companySockets.has(socket.companyId)) {
          this.companySockets.get(socket.companyId)!.delete(socket.id);
          if (this.companySockets.get(socket.companyId)!.size === 0) {
            this.companySockets.delete(socket.companyId);
          }
        }
      });
    });
  }

  // Send notification to specific user
  async notifyUser(userId: string, notification: NotificationPayload) {
    if (!this.io) return;

    // Store in database
    await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        metadata: notification.metadata || {},
        read: false,
      },
    });

    // Send real-time notification
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  // Send notification to all users in a company
  async notifyCompany(companyId: string, notification: NotificationPayload, excludeUserId?: string) {
    if (!this.io) return;

    // Get all users in company
    const users = await prisma.user.findMany({
      where: {
        companyId,
        id: excludeUserId ? { not: excludeUserId } : undefined,
      },
      select: { id: true },
    });

    // Store notifications in database
    await prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        metadata: notification.metadata || {},
        read: false,
      })),
    });

    // Send real-time notification
    this.io.to(`company:${companyId}`).emit('notification', notification);
  }

  // Send notification to users with specific role in company
  async notifyRole(companyId: string, role: string, notification: NotificationPayload) {
    if (!this.io) return;

    // Get users with specific role
    const users = await prisma.user.findMany({
      where: {
        companyId,
        role,
      },
      select: { id: true },
    });

    // Store and send notifications
    for (const user of users) {
      await this.notifyUser(user.id, notification);
    }
  }

  // Broadcast update to entity subscribers
  broadcastEntityUpdate(entityType: string, entityId: string, update: any) {
    if (!this.io) return;

    this.io.to(`${entityType}:${entityId}`).emit('entityUpdate', {
      type: entityType,
      id: entityId,
      update,
      timestamp: new Date(),
    });
  }

  // Send real-time finding update
  broadcastFindingUpdate(findingId: string, update: any) {
    this.broadcastEntityUpdate('finding', findingId, update);
  }

  // Send real-time pentest update
  broadcastPentestUpdate(pentestId: string, update: any) {
    this.broadcastEntityUpdate('pentest', pentestId, update);
  }

  // Send real-time comment
  async broadcastComment(comment: any, entityType: string, entityId: string) {
    if (!this.io) return;

    this.io.to(`${entityType}:${entityId}`).emit('newComment', {
      entityType,
      entityId,
      comment,
    });
  }

  // Get online users in company
  getOnlineUsers(companyId: string): string[] {
    const sockets = this.companySockets.get(companyId);
    if (!sockets) return [];

    const onlineUsers: Set<string> = new Set();
    
    sockets.forEach(socketId => {
      const socket = this.io?.sockets.sockets.get(socketId) as AuthenticatedSocket;
      if (socket?.userId) {
        onlineUsers.add(socket.userId);
      }
    });

    return Array.from(onlineUsers);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Get instance
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Helper function to verify entity access
async function verifyEntityAccess(
  userId: string,
  companyId: string,
  entityType: string,
  entityId: string
): Promise<boolean> {
  try {
    switch (entityType) {
      case 'pentest':
        const pentest = await prisma.pentest.findFirst({
          where: {
            id: entityId,
            companyId,
          },
        });
        return !!pentest;

      case 'finding':
        const finding = await prisma.finding.findFirst({
          where: {
            id: entityId,
            companyId,
          },
        });
        return !!finding;

      case 'target':
        const target = await prisma.target.findFirst({
          where: {
            id: entityId,
            companyId,
          },
        });
        return !!target;

      case 'report':
        const report = await prisma.report.findFirst({
          where: {
            id: entityId,
            companyId,
          },
        });
        return !!report;

      default:
        return false;
    }
  } catch (error) {
    console.error('Entity access verification error:', error);
    return false;
  }
}

// Export singleton instance
export const wsServer = new WebSocketServer();

// Export notification helpers
export const notificationHelpers = {
  // Finding notifications
  async notifyNewFinding(finding: any) {
    const notification: NotificationPayload = {
      id: `finding-${finding.id}-${Date.now()}`,
      type: 'finding',
      title: 'New Finding Reported',
      message: `${finding.title} (${finding.severity})`,
      link: `/dashboard/findings/${finding.id}`,
      metadata: {
        findingId: finding.id,
        severity: finding.severity,
        pentestId: finding.pentestId,
      },
      createdAt: new Date(),
    };

    await wsServer.notifyCompany(finding.companyId, notification, finding.reporterId);
  },

  // Pentest notifications
  async notifyPentestStatusChange(pentest: any, oldStatus: string, newStatus: string) {
    const notification: NotificationPayload = {
      id: `pentest-${pentest.id}-${Date.now()}`,
      type: 'pentest',
      title: 'Pentest Status Updated',
      message: `${pentest.title} changed from ${oldStatus} to ${newStatus}`,
      link: `/dashboard/pentests/${pentest.id}`,
      metadata: {
        pentestId: pentest.id,
        oldStatus,
        newStatus,
      },
      createdAt: new Date(),
    };

    await wsServer.notifyCompany(pentest.companyId, notification);
  },

  // Report notifications
  async notifyReportGenerated(report: any) {
    const notification: NotificationPayload = {
      id: `report-${report.id}-${Date.now()}`,
      type: 'report',
      title: 'Report Generated',
      message: `${report.title} is ready for download`,
      link: `/dashboard/reports/${report.id}`,
      metadata: {
        reportId: report.id,
        format: report.format,
      },
      createdAt: new Date(),
    };

    await wsServer.notifyCompany(report.companyId, notification);
  },

  // Comment notifications
  async notifyNewComment(comment: any, entityType: string, entityTitle: string) {
    const notification: NotificationPayload = {
      id: `comment-${comment.id}-${Date.now()}`,
      type: 'comment',
      title: 'New Comment',
      message: `${comment.author.fullName} commented on ${entityTitle}`,
      link: `/dashboard/${entityType}s/${comment.entityId}`,
      metadata: {
        commentId: comment.id,
        entityType,
        entityId: comment.entityId,
      },
      createdAt: new Date(),
    };

    // Notify all participants except the comment author
    const participants = await getEntityParticipants(entityType, comment.entityId);
    for (const userId of participants) {
      if (userId !== comment.authorId) {
        await wsServer.notifyUser(userId, notification);
      }
    }
  },

  // Assignment notifications
  async notifyAssignment(finding: any, assignedUser: any) {
    const notification: NotificationPayload = {
      id: `assignment-${finding.id}-${Date.now()}`,
      type: 'finding',
      title: 'Finding Assigned to You',
      message: `You have been assigned to ${finding.title}`,
      link: `/dashboard/findings/${finding.id}`,
      metadata: {
        findingId: finding.id,
        severity: finding.severity,
      },
      createdAt: new Date(),
    };

    await wsServer.notifyUser(assignedUser.id, notification);
  },
};

// Helper to get entity participants
async function getEntityParticipants(entityType: string, entityId: string): Promise<string[]> {
  const participants = new Set<string>();

  switch (entityType) {
    case 'finding':
      const finding = await prisma.finding.findUnique({
        where: { id: entityId },
        include: {
          reporter: true,
          assignedTo: true,
          comments: {
            include: { author: true },
          },
        },
      });

      if (finding) {
        if (finding.reporter) participants.add(finding.reporter.id);
        if (finding.assignedTo) participants.add(finding.assignedTo.id);
        finding.comments.forEach(c => participants.add(c.author.id));
      }
      break;

    case 'pentest':
      const pentest = await prisma.pentest.findUnique({
        where: { id: entityId },
        include: {
          createdBy: true,
          findings: {
            include: { reporter: true },
          },
        },
      });

      if (pentest) {
        participants.add(pentest.createdBy.id);
        pentest.findings.forEach(f => {
          if (f.reporter) participants.add(f.reporter.id);
        });
      }
      break;
  }

  return Array.from(participants);
}