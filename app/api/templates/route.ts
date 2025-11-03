import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireAdminApi } from '@/lib/auth-helpers';
import { createTemplateSchema } from '@/lib/validations';
import { handleApiError, successResponse, paginatedResponse } from '@/lib/api-response';

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};

    // Show public templates + company-specific templates
    if (user.role === 'CLIENT' && user.companyId) {
      where.OR = [
        { isPublic: true },
        { companyId: user.companyId },
      ];
    }

    if (category) where.category = category;
    if (severity) where.severity = severity;

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Get total count
    const total = await prisma.template.count({ where });

    // Get templates
    const templates = await prisma.template.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return paginatedResponse(templates, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    // Only ADMIN can create templates
    const user = await requireAdminApi();

    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    const template = await prisma.template.create({
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

    return successResponse(template, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
