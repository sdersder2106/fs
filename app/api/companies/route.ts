import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireAdminApi } from '@/lib/auth-helpers';
import { createCompanySchema } from '@/lib/validations';
import { handleApiError, successResponse, paginatedResponse } from '@/lib/api-response';

// GET /api/companies - List all companies
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Search
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};

    // ADMIN can see all companies, CLIENT only their own
    if (user.role === 'CLIENT' && user.companyId) {
      where.id = user.companyId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.company.count({ where });

    // Get companies with relations
    const companies = await prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            targets: true,
            pentests: true,
            findings: true,
          },
        },
      },
    });

    return paginatedResponse(companies, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/companies - Create new company
export async function POST(request: NextRequest) {
  try {
    // Only ADMIN can create companies
    await requireAdminApi();

    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    const company = await prisma.company.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            users: true,
            targets: true,
            pentests: true,
          },
        },
      },
    });

    return successResponse(company, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
