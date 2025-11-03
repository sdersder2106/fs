import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  getPaginationParams,
  getQueryParams,
  paginatedResponse
} from '@/lib/api-response';
import { 
  getUserNotifications, 
  getNotificationCount,
  deleteOldNotifications 
} from '@/lib/notifications';

// GET /api/notifications - List user notifications
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const params = getQueryParams(request);
    const { page, limit, skip } = getPaginationParams(params);
    
    // Parse filters
    const filters = {
      type: params.get('type'),
      isRead: params.get('isRead'),
      query: params.get('query'),
    };

    // Build where clause
    const where: any = { userId: user.id };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isRead !== null) {
      where.isRead = filters.isRead === 'true';
    }

    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { message: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Get notifications
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      getNotificationCount(user.id, true),
    ]);

    // Auto-cleanup old read notifications (older than 30 days)
    await deleteOldNotifications(user.id, 30);

    // Format notifications with additional metadata
    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      isNew: !notification.isRead && 
        (Date.now() - notification.createdAt.getTime()) < 24 * 60 * 60 * 1000, // Less than 24 hours
    }));

    // Return with additional metadata
    const response = {
      items: formattedNotifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
      hasUnread: unreadCount > 0,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch notifications', 500);
  }
}

// POST /api/notifications - Create notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Only allow creating notifications for system/admin actions
    if (user.role !== 'ADMIN') {
      return errorResponse('Only admins can create notifications', 403);
    }

    const body = await request.json();
    const { userId, title, message, type, link } = body;

    if (!userId || !title || !message) {
      return errorResponse('Missing required fields', 400);
    }

    // Verify target user exists and belongs to same company
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: user.companyId,
      },
    });

    if (!targetUser) {
      return errorResponse('Target user not found', 404);
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'INFO',
        link,
      },
    });

    return successResponse(notification, 'Notification created successfully');
  } catch (error) {
    console.error('Error creating notification:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to create notification', 500);
  }
}
