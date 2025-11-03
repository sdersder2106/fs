import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { createCommentSchema } from '@/lib/validations';
import { handleApiError, successResponse, paginatedResponse } from '@/lib/api-response';

// GET /api/comments - List all comments
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const pentestId = searchParams.get('pentestId');
    const findingId = searchParams.get('findingId');
    const targetId = searchParams.get('targetId');
    const authorId = searchParams.get('authorId');

    // Build where clause
    const where: any = {};

    if (pentestId) where.pentestId = pentestId;
    if (findingId) where.findingId = findingId;
    if (targetId) where.targetId = targetId;
    if (authorId) where.authorId = authorId;

    // Get total count
    const total = await prisma.comment.count({ where });

    // Get comments
    const comments = await prisma.comment.findMany({
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
          },
        },
        pentest: {
          select: {
            id: true,
            title: true,
          },
        },
        finding: {
          select: {
            id: true,
            title: true,
            severity: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return paginatedResponse(comments, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const body = await request.json();

    // Auto-set authorId to current user
    body.authorId = user.id;

    const validatedData = createCommentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: validatedData,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        pentest: {
          select: {
            id: true,
            title: true,
          },
        },
        finding: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return successResponse(comment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
