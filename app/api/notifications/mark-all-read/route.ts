import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { handleApiError, successWithMessage } from '@/lib/api-response';

// POST /api/notifications/mark-all-read - Mark all user notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return successWithMessage(
      { count: result.count },
      `Marked ${result.count} notifications as read`
    );
  } catch (error) {
    return handleApiError(error);
  }
}
