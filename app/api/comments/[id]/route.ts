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
import { updateCommentSchema } from '@/lib/validations';

interface RouteParams {
  params: { id: string };
}

// GET /api/comments/[id] - Get single comment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const comment = await prisma.comment.findUnique({
      where: { id },
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
        pentest: {
          select: {
            id: true,
            title: true,
            companyId: true,
          },
        },
        finding: {
          select: {
            id: true,
            title: true,
            severity: true,
            companyId: true,
          },
        },
      },
    });

    if (!comment) {
      return notFoundResponse('Comment');
    }

    // Verify user has access (through pentest or finding company)
    const companyId = comment.pentest?.companyId || comment.finding?.companyId;
    if (companyId !== user.companyId) {
      return forbiddenResponse('Access denied');
    }

    const responseData = {
      id: comment.id,
      text: comment.text,
      author: comment.author,
      pentest: comment.pentest ? {
        id: comment.pentest.id,
        title: comment.pentest.title,
      } : undefined,
      finding: comment.finding ? {
        id: comment.finding.id,
        title: comment.finding.title,
        severity: comment.finding.severity,
      } : undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isEdited: comment.createdAt.getTime() !== comment.updatedAt.getTime(),
    };

    return successResponse(responseData);
  } catch (error) {
    console.error('Error fetching comment:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to fetch comment', 500);
  }
}

// PUT /api/comments/[id] - Update comment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateCommentSchema.safeParse({ ...body, id });
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    // Check if comment exists and get author
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        pentest: {
          select: { companyId: true },
        },
        finding: {
          select: { companyId: true },
        },
      },
    });

    if (!existingComment) {
      return notFoundResponse('Comment');
    }

    // Verify user has access to the company
    const companyId = existingComment.pentest?.companyId || existingComment.finding?.companyId;
    if (companyId !== user.companyId) {
      return forbiddenResponse('Access denied');
    }

    // Only author can edit their own comment
    if (existingComment.authorId !== user.id) {
      return forbiddenResponse('You can only edit your own comments');
    }

    // Check if comment is too old to edit (e.g., 1 hour)
    const editTimeLimit = 60 * 60 * 1000; // 1 hour in milliseconds
    const timeSinceCreation = Date.now() - existingComment.createdAt.getTime();
    
    if (timeSinceCreation > editTimeLimit && user.role !== 'ADMIN') {
      return errorResponse('Comments can only be edited within 1 hour of creation', 400);
    }

    const { text } = validationResult.data;

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { text },
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

    const responseData = {
      id: updatedComment.id,
      text: updatedComment.text,
      author: updatedComment.author,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
      isEdited: true,
    };

    return updatedResponse(responseData, 'Comment updated successfully');
  } catch (error) {
    console.error('Error updating comment:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to update comment', 500);
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        pentest: {
          select: { companyId: true },
        },
        finding: {
          select: { companyId: true },
        },
      },
    });

    if (!comment) {
      return notFoundResponse('Comment');
    }

    // Verify user has access to the company
    const companyId = comment.pentest?.companyId || comment.finding?.companyId;
    if (companyId !== user.companyId) {
      return forbiddenResponse('Access denied');
    }

    // Only author and admins can delete comments
    if (comment.authorId !== user.id && user.role !== 'ADMIN') {
      return forbiddenResponse('You can only delete your own comments');
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id },
    });

    return deletedResponse('Comment deleted successfully');
  } catch (error) {
    console.error('Error deleting comment:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to delete comment', 500);
  }
}
