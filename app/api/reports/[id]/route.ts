import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { updateReportSchema } from '@/lib/validations';
import { 
  handleApiError, 
  successResponse, 
  notFoundResponse,
  successWithMessage,
  forbiddenResponse 
} from '@/lib/api-response';

// GET /api/reports/[id] - Get report by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();

    const report = await prisma.report.findUnique({
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
            target: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            findings: {
              orderBy: { severity: 'asc' },
              include: {
                reporter: {
                  select: {
                    id: true,
                    fullName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        generator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!report) {
      return notFoundResponse('Report');
    }

    // Check access
    if (user.role === 'CLIENT' && report.companyId !== user.companyId) {
      return forbiddenResponse();
    }

    return successResponse(report);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/reports/[id] - Update report
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    const body = await request.json();

    // Get report first to check access
    const existingReport = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!existingReport) {
      return notFoundResponse('Report');
    }

    // Check access
    if (user.role === 'CLIENT' && existingReport.companyId !== user.companyId) {
      return forbiddenResponse();
    }

    const validatedData = updateReportSchema.parse(body);

    const report = await prisma.report.update({
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
      },
    });

    return successWithMessage(report, 'Report updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/reports/[id] - Delete report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();

    // Get report first to check access
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return notFoundResponse('Report');
    }

    // Check access
    if (user.role === 'CLIENT' && report.companyId !== user.companyId) {
      return forbiddenResponse();
    }

    await prisma.report.delete({
      where: { id: params.id },
    });

    return successWithMessage(null, 'Report deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
