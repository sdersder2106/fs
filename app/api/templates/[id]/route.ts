import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireAdminApi } from '@/lib/auth-helpers';
import { createTemplateSchema } from '@/lib/validations';
import { 
  handleApiError, 
  successResponse, 
  notFoundResponse,
  successWithMessage 
} from '@/lib/api-response';

// GET /api/templates/[id] - Get template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getAuthUser();

    const template = await prisma.template.findUnique({
      where: { id: params.id },
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

    return successResponse(template);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/templates/[id] - Update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only ADMIN can update templates
    await requireAdminApi();

    const body = await request.json();
    const validatedData = createTemplateSchema.partial().parse(body);

    const template = await prisma.template.update({
      where: { id: params.id },
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

    return successWithMessage(template, 'Template updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only ADMIN can delete templates
    await requireAdminApi();

    await prisma.template.delete({
      where: { id: params.id },
    });

    return successWithMessage(null, 'Template deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
