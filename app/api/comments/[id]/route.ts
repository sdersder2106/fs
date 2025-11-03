import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { updateCommentSchema } from '@/lib/validations';
import { 
  handleApiError, 
  successResponse, 
  notFoundResponse,
  successWithMessage,
  forbiddenResponse 
} from '@/lib/api-response';

// GET /api/comments/[id] - Get comment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getAuthUser();

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
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

    if (!comment) {
      return notFoundResponse('Comment');
    }

    return successResponse(comment);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/comments/[id] - Update comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    const body = await request.json();

    // Get comment first to check ownership
    const existingComment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!existingComment) {
      return notFoundResponse('Comment');
    }

    // Only author can update their comment
    if (existingComment.authorId !== user.id && user.role !== 'ADMIN') {
      return forbiddenResponse('You can only edit your own comments');
    }

    const validatedData = updateCommentSchema.parse(body);

    const comment = await prisma.comment.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return successWithMessage(comment, 'Comment updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();

    // Get comment first to check ownership
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return notFoundResponse('Comment');
    }

    // Only author or ADMIN can delete comment
    if (comment.authorId !== user.id && user.role !== 'ADMIN') {
      return forbiddenResponse('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: params.id },
    });

    return successWithMessage(null, 'Comment deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
