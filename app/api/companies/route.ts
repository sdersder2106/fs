import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  createdResponse,
  getPaginationParams,
  getQueryParams,
  buildWhereClause,
  paginatedResponse
} from '@/lib/api-response';
import { createCompanySchema } from '@/lib/validations';

// GET /api/companies - List companies (for current user)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const params = getQueryParams(request);
    const { page, limit, skip } = getPaginationParams(params);
    
    // Build where clause
    let where: any = {};

    // For non-admins, only show their company
    if (user.role !== 'ADMIN') {
      where.id = user.companyId;
    } else {
      // Admins can search companies
      const query = params.get('query');
      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { domain: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }
    }

    // Get companies with counts
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              users: true,
              pentests: true,
              targets: true,
              findings: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    // Format response
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      domain: company.domain,
      logo: company.logo,
      description: company.description,
      stats: {
        users: company._count.users,
        pentests: company._count.pentests,
        targets: company._count.targets,
        findings: company._count.findings,
      },
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }));

    return paginatedResponse(formattedCompanies, page, limit, total);
  } catch (error) {
    console.error('Error fetching companies:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch companies', 500);
  }
}

// POST /api/companies - Create new company (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    
    // Validate input
    const validationResult = createCompanySchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const { name, domain, logo, description } = validationResult.data;

    // Check if company with same name or domain exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          ...(domain ? [{ domain: { equals: domain, mode: 'insensitive' } }] : []),
        ],
      },
    });

    if (existingCompany) {
      return errorResponse('Company with this name or domain already exists', 409);
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        domain,
        logo,
        description,
      },
      include: {
        _count: {
          select: {
            users: true,
            pentests: true,
            targets: true,
            findings: true,
          },
        },
      },
    });

    const responseData = {
      id: company.id,
      name: company.name,
      domain: company.domain,
      logo: company.logo,
      description: company.description,
      stats: {
        users: company._count.users,
        pentests: company._count.pentests,
        targets: company._count.targets,
        findings: company._count.findings,
      },
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    return createdResponse(responseData, 'Company created successfully');
  } catch (error) {
    console.error('Error creating company:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to create company', 500);
  }
}
