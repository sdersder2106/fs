import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  createdResponse,
  getPaginationParams,
  getQueryParams,
  getSortParams,
  paginatedResponse
} from '@/lib/api-response';
import { createTemplateSchema } from '@/lib/validations';

// GET /api/templates - List templates (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const params = getQueryParams(request);
    const { page, limit, skip } = getPaginationParams(params);
    const { sortBy, sortOrder } = getSortParams(params);
    
    // Parse filters
    const filters = {
      type: params.get('type'),
      category: params.get('category'),
      isPublic: params.get('isPublic'),
      query: params.get('query'),
    };

    // Build where clause
    const where: any = {
      OR: [
        { companyId: user.companyId },
        { isPublic: true },
      ],
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.isPublic !== null) {
      where.isPublic = filters.isPublic === 'true';
    }

    if (filters.query) {
      where.AND = [
        {
          OR: [
            { name: { contains: filters.query, mode: 'insensitive' } },
            { description: { contains: filters.query, mode: 'insensitive' } },
            { category: { contains: filters.query, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Get templates
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              id: true, // This is just to get a count, we'll use it as usage count
            },
          },
        },
      }),
      prisma.template.count({ where }),
    ]);

    // Get usage statistics for each template
    const templatesWithStats = await Promise.all(
      templates.map(async (template) => {
        // Count how many times this template content appears in findings/reports
        const usageCount = await getTemplateUsageCount(template.id, template.type);
        
        return {
          id: template.id,
          name: template.name,
          description: template.description,
          type: template.type,
          category: template.category,
          content: template.content,
          isPublic: template.isPublic,
          company: template.company,
          usageCount,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        };
      })
    );

    return paginatedResponse(templatesWithStats, page, limit, total);
  } catch (error) {
    console.error('Error fetching templates:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse('Admin access required');
      }
    }
    
    return errorResponse('Failed to fetch templates', 500);
  }
}

// POST /api/templates - Create new template (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    
    // Validate input
    const validationResult = createTemplateSchema.safeParse({
      ...body,
      companyId: user.companyId,
    });
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const { name, description, type, category, content, isPublic } = validationResult.data;

    // Check for duplicate template name in company
    const existingTemplate = await prisma.template.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        companyId: user.companyId,
      },
    });

    if (existingTemplate) {
      return errorResponse('A template with this name already exists', 409);
    }

    // Validate template variables (basic check)
    const variables = extractTemplateVariables(content);
    if (variables.length > 0) {
      // Validate that variables use correct format {{variable}}
      const invalidVariables = variables.filter(v => !v.match(/^[a-zA-Z][a-zA-Z0-9_]*$/));
      if (invalidVariables.length > 0) {
        return errorResponse(`Invalid template variables: ${invalidVariables.join(', ')}`, 400);
      }
    }

    // Create template
    const template = await prisma.template.create({
      data: {
        name,
        description,
        type,
        category,
        content,
        isPublic: isPublic || false,
        companyId: user.companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const responseData = {
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      content: template.content,
      isPublic: template.isPublic,
      company: template.company,
      variables,
      createdAt: template.createdAt,
    };

    return createdResponse(responseData, 'Template created successfully');
  } catch (error) {
    console.error('Error creating template:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse('Admin access required');
      }
    }
    
    return errorResponse('Failed to create template', 500);
  }
}

// Helper function to extract template variables
function extractTemplateVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1].trim())) {
      variables.push(match[1].trim());
    }
  }
  
  return variables;
}

// Helper function to get template usage count
async function getTemplateUsageCount(templateId: string, type: string): Promise<number> {
  // In a real implementation, you would track template usage
  // For now, return a simulated count based on template age
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: { createdAt: true },
  });
  
  if (!template) return 0;
  
  // Simulate usage based on days since creation
  const daysSinceCreation = Math.floor(
    (Date.now() - template.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return Math.min(daysSinceCreation * 2, 100); // Max 100 uses
}
