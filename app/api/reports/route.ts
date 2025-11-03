import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { createReportSchema } from '@/lib/validations';
import { handleApiError, successResponse, paginatedResponse } from '@/lib/api-response';

// GET /api/reports - List all reports
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const companyId = searchParams.get('companyId');
    const pentestId = searchParams.get('pentestId');
    const reportType = searchParams.get('reportType');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};

    // Company filter based on role
    if (user.role === 'CLIENT' && user.companyId) {
      where.companyId = user.companyId;
    } else if (companyId) {
      where.companyId = companyId;
    }

    if (pentestId) where.pentestId = pentestId;
    if (reportType) where.reportType = reportType;
    if (status) where.status = status;

    // Get total count
    const total = await prisma.report.count({ where });

    // Get reports
    const reports = await prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
          },
        },
        generator: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return paginatedResponse(reports, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/reports - Create new report
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const body = await request.json();

    // CLIENT can only create reports for their company
    if (user.role === 'CLIENT' && body.companyId !== user.companyId) {
      throw new Error('Forbidden: Cannot create report for another company');
    }

    // Auto-set generatorId
    body.generatorId = user.id;

    const validatedData = createReportSchema.parse(body);

    const report = await prisma.report.create({
      data: {
        ...validatedData,
        generatorId: user.id,
      },
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
          },
        },
        generator: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return successResponse(report, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
