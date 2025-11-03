import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  createdResponse,
  getPaginationParams,
  getQueryParams,
  paginatedResponse
} from '@/lib/api-response';
import { createCommentSchema } from '@/lib/validations';
import { notificationTemplates, createNotification } from '@/lib/notifications';

// GET /api/comments - List comments for pentest or finding
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const params = getQueryParams(request);
    const { page, limit, skip } = getPaginationParams(params);
    
    const pentestId = params.get('pentestId');
    const findingId = params.get('findingId');

    if (!pentestId && !findingId) {
      return errorResponse('Either pentestId or findingId is required', 400);
    }

    // Build where clause
    const where: any = {};

    if (pentestId) {
      // Verify pentest belongs to user's company
      const pentest = await prisma.pentest.findFirst({
        where: {
          id: pentestId,
          companyId: user.companyId,
        },
      });

      if (!pentest) {
        return errorResponse('Pentest not found or access denied', 404);
      }

      where.pentestId = pentestId;
    }

    if (findingId) {
      // Verify finding belongs to user's company
      const finding = await prisma.finding.findFirst({
        where: {
          id: findingId,
          companyId: user.companyId,
        },
      });

      if (!finding) {
        return errorResponse('Finding not found or access denied', 404);
      }

      where.findingId = findingId;
    }

    // Get comments with author details
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          pentest: pentestId ? undefined : {
            select: {
              id: true,
              title: true,
            },
          },
          finding: findingId ? undefined : {
            select: {
              id: true,
              title: true,
              severity: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    // Format response
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      text: comment.text,
      author: comment.author,
      pentest: comment.pentest,
      finding: comment.finding,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isEdited: comment.createdAt.getTime() !== comment.updatedAt.getTime(),
    }));

    return paginatedResponse(formattedComments, page, limit, total);
  } catch (error) {
    console.error('Error fetching comments:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch comments', 500);
  }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    // Validate input
    const validationResult = createCommentSchema.safeParse({
      ...body,
      authorId: user.id,
    });
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const { text, pentestId, findingId } = validationResult.data;

    // Verify target entity exists and user has access
    let entityTitle = '';
    let entityType = '';
    let notifyUserIds: string[] = [];

    if (pentestId) {
      const pentest = await prisma.pentest.findFirst({
        where: {
          id: pentestId,
          companyId: user.companyId,
        },
        include: {
          createdBy: {
            select: { id: true },
          },
        },
      });

      if (!pentest) {
        return errorResponse('Pentest not found or access denied', 404);
      }

      entityTitle = pentest.title;
      entityType = 'pentest';
      notifyUserIds.push(pentest.createdBy.id);
    }

    if (findingId) {
      const finding = await prisma.finding.findFirst({
        where: {
          id: findingId,
          companyId: user.companyId,
        },
        include: {
          reporter: {
            select: { id: true },
          },
          assignedTo: {
            select: { id: true },
          },
        },
      });

      if (!finding) {
        return errorResponse('Finding not found or access denied', 404);
      }

      entityTitle = finding.title;
      entityType = 'finding';
      notifyUserIds.push(finding.reporter.id);
      if (finding.assignedTo) {
        notifyUserIds.push(finding.assignedTo.id);
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        text,
        pentestId,
        findingId,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Send notifications to relevant users (except the comment author)
    const uniqueUserIds = [...new Set(notifyUserIds)].filter(id => id !== user.id);
    
    if (uniqueUserIds.length > 0) {
      const notification = notificationTemplates.commentAdded(
        entityType,
        entityTitle,
        pentestId || findingId || ''
      );

      await Promise.all(
        uniqueUserIds.map(userId =>
          createNotification({
            userId,
            ...notification,
          })
        )
      );
    }

    // Also notify other commenters on the same entity
    const previousCommenters = await prisma.comment.findMany({
      where: {
        OR: [
          ...(pentestId ? [{ pentestId }] : []),
          ...(findingId ? [{ findingId }] : []),
        ],
        NOT: {
          authorId: user.id,
        },
      },
      select: {
        authorId: true,
      },
      distinct: ['authorId'],
    });

    const commenterIds = previousCommenters
      .map(c => c.authorId)
      .filter(id => !uniqueUserIds.includes(id));

    if (commenterIds.length > 0) {
      const notification = notificationTemplates.commentAdded(
        entityType,
        entityTitle,
        pentestId || findingId || ''
      );

      await Promise.all(
        commenterIds.map(userId =>
          createNotification({
            userId,
            ...notification,
          })
        )
      );
    }

    const responseData = {
      id: comment.id,
      text: comment.text,
      author: comment.author,
      pentestId: comment.pentestId,
      findingId: comment.findingId,
      createdAt: comment.createdAt,
    };

    return createdResponse(responseData, 'Comment added successfully');
  } catch (error) {
    console.error('Error creating comment:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to create comment', 500);
  }
}
