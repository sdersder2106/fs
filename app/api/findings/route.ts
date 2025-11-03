import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { createFindingSchema } from '@/lib/validations';
import { handleApiError, successResponse, paginatedResponse } from '@/lib/api-response';

// GET /api/findings - List all findings
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
    const targetId = searchParams.get('targetId');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const assignedToId = searchParams.get('assignedToId');
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};

    // Company filter based on role
    if (user.role === 'CLIENT' && user.companyId) {
      where.companyId = user.companyId;
    } else if (companyId) {
      where.companyId = companyId;
    }

    // Other filters
    if (pentestId) where.pentestId = pentestId;
    if (targetId) where.targetId = targetId;
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;

    // Search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.finding.count({ where });

    // Get findings
    const findings = await prisma.finding.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { severity: 'asc' }, // CRITICAL first
        { createdAt: 'desc' },
      ],
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
            status: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            type: true,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return paginatedResponse(findings, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/findings - Create new finding
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const body = await request.json();

    // CLIENT can only create findings for their company
    if (user.role === 'CLIENT' && body.companyId !== user.companyId) {
      throw new Error('Forbidden: Cannot create finding for another company');
    }

    // Auto-set reporterId to current user
    body.reporterId = user.id;

    const validatedData = createFindingSchema.parse(body);

    const finding = await prisma.finding.create({
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
        target: {
          select: {
            id: true,
            name: true,
          },
        },
        reporter: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return successResponse(finding, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
