import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  updatedResponse,
  deletedResponse
} from '@/lib/api-response';
import { updateTemplateSchema } from '@/lib/validations';

interface RouteParams {
  params: { id: string };
}

// GET /api/templates/[id] - Get single template (ADMIN only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = params;

    const template = await prisma.template.findFirst({
      where: { 
        id,
        OR: [
          { companyId: user.companyId },
          { isPublic: true },
        ],
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

    if (!template) {
      return notFoundResponse('Template');
    }

    // Extract variables from content
    const variables = extractTemplateVariables(template.content);

    // Get usage examples (simulated)
    const usageExamples = await getTemplateUsageExamples(template.id, template.type);

    const responseData = {
      ...template,
      variables,
      usageExamples,
      canEdit: template.companyId === user.companyId,
    };

    return successResponse(responseData);
  } catch (error) {
    console.error('Error fetching template:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse('Admin access required');
      }
    }
    
    return errorResponse('Failed to fetch template', 500);
  }
}

// PUT /api/templates/[id] - Update template (ADMIN only, own company)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = params;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateTemplateSchema.safeParse({ ...body, id });
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    // Check if template exists and belongs to user's company
    const existingTemplate = await prisma.template.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
    });

    if (!existingTemplate) {
      return notFoundResponse('Template not found or you do not have permission to edit it');
    }

    const { name, description, type, category, content, isPublic } = validationResult.data;

    // Check for duplicate name if changing
    if (name && name !== existingTemplate.name) {
      const duplicate = await prisma.template.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          companyId: user.companyId,
          NOT: { id },
        },
      });

      if (duplicate) {
        return errorResponse('A template with this name already exists', 409);
      }
    }

    // Validate template variables if content changed
    let variables: string[] = [];
    if (content) {
      variables = extractTemplateVariables(content);
      const invalidVariables = variables.filter(v => !v.match(/^[a-zA-Z][a-zA-Z0-9_]*$/));
      if (invalidVariables.length > 0) {
        return errorResponse(`Invalid template variables: ${invalidVariables.join(', ')}`, 400);
      }
    }

    // Update template
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(category !== undefined && { category }),
        ...(content && { content }),
        ...(isPublic !== undefined && { isPublic }),
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
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      type: updatedTemplate.type,
      category: updatedTemplate.category,
      content: updatedTemplate.content,
      isPublic: updatedTemplate.isPublic,
      company: updatedTemplate.company,
      variables: content ? variables : extractTemplateVariables(updatedTemplate.content),
      updatedAt: updatedTemplate.updatedAt,
    };

    return updatedResponse(responseData, 'Template updated successfully');
  } catch (error) {
    console.error('Error updating template:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse('Admin access required');
      }
    }
    
    return errorResponse('Failed to update template', 500);
  }
}

// DELETE /api/templates/[id] - Delete template (ADMIN only, own company)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = params;

    // Check if template exists and belongs to user's company
    const template = await prisma.template.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
    });

    if (!template) {
      return notFoundResponse('Template not found or you do not have permission to delete it');
    }

    // Delete template
    await prisma.template.delete({
      where: { id },
    });

    return deletedResponse('Template deleted successfully');
  } catch (error) {
    console.error('Error deleting template:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse('Admin access required');
      }
    }
    
    return errorResponse('Failed to delete template', 500);
  }
}

// Helper function to extract template variables
function extractTemplateVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
}

// Helper function to get template usage examples
async function getTemplateUsageExamples(templateId: string, type: string): Promise<any[]> {
  // In a real implementation, you would track where templates are used
  // For now, return simulated examples
  
  if (type === 'FINDING') {
    return [
      {
        type: 'finding',
        title: 'SQL Injection in Login Form',
        usedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        type: 'finding',
        title: 'XSS in Search Function',
        usedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
    ];
  } else if (type === 'REPORT') {
    return [
      {
        type: 'report',
        title: 'Q4 2024 Security Assessment Report',
        usedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];
  }
  
  return [];
}
