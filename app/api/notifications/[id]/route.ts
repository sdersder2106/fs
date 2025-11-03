import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  updatedResponse,
  deletedResponse
} from '@/lib/api-response';
import { markNotificationRead, deleteNotification } from '@/lib/notifications';

interface RouteParams {
  params: { id: string };
}

// GET /api/notifications/[id] - Get single notification
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return notFoundResponse('Notification');
    }

    // Verify notification belongs to user
    if (notification.userId !== user.id) {
      return forbiddenResponse('Access denied');
    }

    // Auto-mark as read when fetched individually
    if (!notification.isRead) {
      await markNotificationRead(id, user.id);
      notification.isRead = true;
    }

    return successResponse(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to fetch notification', 500);
  }
}

// PUT /api/notifications/[id] - Mark notification as read
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();
    
    const { isRead = true } = body;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return notFoundResponse('Notification');
    }

    if (notification.userId !== user.id) {
      return forbiddenResponse('You can only update your own notifications');
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead },
    });

    return updatedResponse(
      updatedNotification, 
      isRead ? 'Notification marked as read' : 'Notification marked as unread'
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to update notification', 500);
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return notFoundResponse('Notification');
    }

    if (notification.userId !== user.id) {
      return forbiddenResponse('You can only delete your own notifications');
    }

    // Delete notification
    await deleteNotification(id, user.id);

    return deletedResponse('Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to delete notification', 500);
  }
}
