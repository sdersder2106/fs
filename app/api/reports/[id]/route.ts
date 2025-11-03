import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePentester } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  updatedResponse,
  deletedResponse
} from '@/lib/api-response';
import { updateReportSchema } from '@/lib/validations';
import { notificationTemplates, notifyCompanyUsers } from '@/lib/notifications';

interface RouteParams {
  params: { id: string };
}

// GET /api/reports/[id] - Get single report with details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const report = await prisma.report.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
      include: {
        pentest: {
          include: {
            target: true,
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            findings: {
              orderBy: [
                { severity: 'asc' },
                { cvssScore: 'desc' },
              ],
              include: {
                reporter: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
                assignedTo: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                findings: true,
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
            role: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!report) {
      return notFoundResponse('Report');
    }

    // Calculate statistics
    const statistics = {
      totalFindings: report.pentest._count.findings,
      findingsBySeverity: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
        INFO: 0,
      },
      findingsByStatus: {
        OPEN: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
        CLOSED: 0,
      },
      averageCVSS: 0,
      totalCVSS: 0,
    };

    report.pentest.findings.forEach(finding => {
      statistics.findingsBySeverity[finding.severity as keyof typeof statistics.findingsBySeverity]++;
      statistics.findingsByStatus[finding.status as keyof typeof statistics.findingsByStatus]++;
      statistics.totalCVSS += finding.cvssScore;
    });

    if (report.pentest.findings.length > 0) {
      statistics.averageCVSS = statistics.totalCVSS / report.pentest.findings.length;
    }

    // Format response
    const responseData = {
      ...report,
      statistics,
    };

    return successResponse(responseData);
  } catch (error) {
    console.error('Error fetching report:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch report', 500);
  }
}

// PUT /api/reports/[id] - Update report
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePentester();
    const { id } = params;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateReportSchema.safeParse({ ...body, id });
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    // Check if report exists
    const existingReport = await prisma.report.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
    });

    if (!existingReport) {
      return notFoundResponse('Report');
    }

    // Only generator and admins can update
    if (existingReport.generatedBy !== user.id && user.role !== 'ADMIN') {
      return forbiddenResponse('Only the generator or admins can update this report');
    }

    const { title, reportType, status, format, fileUrl } = validationResult.data;

    // Track status changes for notifications
    const statusChanged = status && status !== existingReport.status;
    const wasApproved = statusChanged && status === 'APPROVED';

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(reportType && { reportType }),
        ...(status && { status }),
        ...(format && { format }),
        ...(fileUrl !== undefined && { fileUrl }),
      },
      include: {
        pentest: {
          select: {
            id: true,
            title: true,
            target: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        generator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Send notification if approved
    if (wasApproved) {
      const notification = notificationTemplates.reportApproved(updatedReport.title);
      await notifyCompanyUsers(user.companyId, notification, user.id);
    }

    const responseData = {
      id: updatedReport.id,
      title: updatedReport.title,
      reportType: updatedReport.reportType,
      status: updatedReport.status,
      format: updatedReport.format,
      fileUrl: updatedReport.fileUrl,
      pentest: updatedReport.pentest,
      generator: updatedReport.generator,
      generatedAt: updatedReport.generatedAt,
      updatedAt: updatedReport.updatedAt,
    };

    return updatedResponse(responseData, 'Report updated successfully');
  } catch (error) {
    console.error('Error updating report:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to update report', 500);
  }
}

// DELETE /api/reports/[id] - Delete report
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePentester();
    const { id } = params;

    // Check if report exists
    const report = await prisma.report.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
    });

    if (!report) {
      return notFoundResponse('Report');
    }

    // Only generator and admins can delete
    if (report.generatedBy !== user.id && user.role !== 'ADMIN') {
      return forbiddenResponse('Only the generator or admins can delete this report');
    }

    // Prevent deletion of approved reports
    if (report.status === 'APPROVED') {
      return errorResponse('Cannot delete approved reports', 400);
    }

    // Delete report
    await prisma.report.delete({
      where: { id },
    });

    // TODO: Delete associated file from storage
    if (report.fileUrl) {
      console.log('TODO: Delete file:', report.fileUrl);
    }

    return deletedResponse('Report deleted successfully');
  } catch (error) {
    console.error('Error deleting report:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to delete report', 500);
  }
}
