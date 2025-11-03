import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse 
} from '@/lib/api-response';
import { markAllNotificationsRead, clearAllNotifications } from '@/lib/notifications';

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Mark all notifications as read
    await markAllNotificationsRead(user.id);

    // Get updated counts
    const { prisma } = await import('@/lib/prisma');
    const [totalCount, unreadCount] = await Promise.all([
      prisma.notification.count({
        where: { userId: user.id },
      }),
      prisma.notification.count({
        where: { 
          userId: user.id,
          isRead: false,
        },
      }),
    ]);

    return successResponse(
      {
        totalCount,
        unreadCount,
        markedAsRead: totalCount - unreadCount,
      },
      'All notifications marked as read'
    );
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to mark notifications as read', 500);
  }
}

// DELETE /api/notifications/mark-all-read - Clear all notifications
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const params = new URL(request.url).searchParams;
    const onlyRead = params.get('onlyRead') === 'true';

    if (onlyRead) {
      // Delete only read notifications
      const { prisma } = await import('@/lib/prisma');
      const result = await prisma.notification.deleteMany({
        where: {
          userId: user.id,
          isRead: true,
        },
      });
      
      return successResponse(
        { deletedCount: result.count },
        'Read notifications cleared successfully'
      );
    } else {
      // Clear all notifications
      await clearAllNotifications(user.id);
      
      return successResponse(
        { deletedCount: 'all' },
        'All notifications cleared successfully'
      );
    }
  } catch (error) {
    console.error('Error clearing notifications:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to clear notifications', 500);
  }
}
