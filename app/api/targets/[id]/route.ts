import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { updateTargetSchema } from '@/lib/validations';
import { 
  handleApiError, 
  successResponse, 
  notFoundResponse,
  successWithMessage,
  forbiddenResponse 
} from '@/lib/api-response';

// GET /api/targets/[id] - Get target by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();

    const target = await prisma.target.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        pentests: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                findings: true,
              },
            },
          },
        },
        findings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
            cvssScore: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            pentests: true,
            findings: true,
          },
        },
      },
    });

    if (!target) {
      return notFoundResponse('Target');
    }

    // Check access
    if (user.role === 'CLIENT' && target.companyId !== user.companyId) {
      return forbiddenResponse();
    }

    return successResponse(target);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/targets/[id] - Update target
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    const body = await request.json();

    // Get target first to check access
    const existingTarget = await prisma.target.findUnique({
      where: { id: params.id },
    });

    if (!existingTarget) {
      return notFoundResponse('Target');
    }

    // Check access
    if (user.role === 'CLIENT' && existingTarget.companyId !== user.companyId) {
      return forbiddenResponse();
    }

    const validatedData = updateTargetSchema.parse(body);

    const target = await prisma.target.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successWithMessage(target, 'Target updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/targets/[id] - Delete target
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();

    // Get target first to check access
    const target = await prisma.target.findUnique({
      where: { id: params.id },
    });

    if (!target) {
      return notFoundResponse('Target');
    }

    // Check access
    if (user.role === 'CLIENT' && target.companyId !== user.companyId) {
      return forbiddenResponse();
    }

    await prisma.target.delete({
      where: { id: params.id },
    });

    return successWithMessage(null, 'Target deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
