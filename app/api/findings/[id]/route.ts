import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { updateFindingSchema } from '@/lib/validations';
import { 
  handleApiError, 
  successResponse, 
  notFoundResponse,
  successWithMessage,
  forbiddenResponse 
} from '@/lib/api-response';

// GET /api/findings/[id] - Get finding by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();

    const finding = await prisma.finding.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        pentest: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            type: true,
            url: true,
          },
        },
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!finding) {
      return notFoundResponse('Finding');
    }

    // Check access
    if (user.role === 'CLIENT' && finding.companyId !== user.companyId) {
      return forbiddenResponse();
    }

    return successResponse(finding);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/findings/[id] - Update finding
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    const body = await request.json();

    // Get finding first to check access
    const existingFinding = await prisma.finding.findUnique({
      where: { id: params.id },
    });

    if (!existingFinding) {
      return notFoundResponse('Finding');
    }

    // Check access
    if (user.role === 'CLIENT' && existingFinding.companyId !== user.companyId) {
      return forbiddenResponse();
    }

    const validatedData = updateFindingSchema.parse(body);

    const finding = await prisma.finding.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        pentest: {
          select: {
            id: true,
            title: true,
          },
        },
        reporter: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return successWithMessage(finding, 'Finding updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/findings/[id] - Delete finding
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();

    // Get finding first to check access
    const finding = await prisma.finding.findUnique({
      where: { id: params.id },
    });

    if (!finding) {
      return notFoundResponse('Finding');
    }

    // Check access
    if (user.role === 'CLIENT' && finding.companyId !== user.companyId) {
      return forbiddenResponse();
    }

    await prisma.finding.delete({
      where: { id: params.id },
    });

    return successWithMessage(null, 'Finding deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
