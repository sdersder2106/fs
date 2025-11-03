import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { 
  handleApiError, 
  successResponse,
  notFoundResponse,
  successWithMessage,
  forbiddenResponse 
} from '@/lib/api-response';

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();

    // Get notification first to check ownership
    const existingNotification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!existingNotification) {
      return notFoundResponse('Notification');
    }

    // Only owner can mark as read
    if (existingNotification.userId !== user.id) {
      return forbiddenResponse('You can only update your own notifications');
    }

    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    });

    return successWithMessage(notification, 'Notification marked as read');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();

    // Get notification first to check ownership
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return notFoundResponse('Notification');
    }

    // Only owner can delete
    if (notification.userId !== user.id) {
      return forbiddenResponse('You can only delete your own notifications');
    }

    await prisma.notification.delete({
      where: { id: params.id },
    });

    return successWithMessage(null, 'Notification deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
