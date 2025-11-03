import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { createNotificationSchema } from '@/lib/validations';
import { handleApiError, successResponse, paginatedResponse } from '@/lib/api-response';

// GET /api/notifications - List user's notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');

    // Build where clause - only user's notifications
    const where: any = {
      userId: user.id,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    if (type) {
      where.type = type;
    }

    // Get total count
    const total = await prisma.notification.count({ where });

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return paginatedResponse(notifications, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    await getAuthUser();

    const body = await request.json();
    const validatedData = createNotificationSchema.parse(body);

    const notification = await prisma.notification.create({
      data: validatedData,
    });

    return successResponse(notification, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
