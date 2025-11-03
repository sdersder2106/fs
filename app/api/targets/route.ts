import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { createTargetSchema } from '@/lib/validations';
import { handleApiError, successResponse, paginatedResponse } from '@/lib/api-response';

// GET /api/targets - List all targets
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};

    // Company filter based on role
    if (user.role === 'CLIENT' && user.companyId) {
      where.companyId = user.companyId;
    } else if (companyId) {
      where.companyId = companyId;
    }

    // Type filter
    if (type) {
      where.type = type;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.target.count({ where });

    // Get targets
    const targets = await prisma.target.findMany({
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
        _count: {
          select: {
            pentests: true,
            findings: true,
          },
        },
      },
    });

    return paginatedResponse(targets, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/targets - Create new target
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const body = await request.json();

    // CLIENT can only create targets for their company
    if (user.role === 'CLIENT' && body.companyId !== user.companyId) {
      throw new Error('Forbidden: Cannot create target for another company');
    }

    const validatedData = createTargetSchema.parse(body);

    const target = await prisma.target.create({
      data: validatedData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return successResponse(target, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
