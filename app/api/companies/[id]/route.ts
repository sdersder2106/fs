import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCompanyAccessApi, requireAdminApi } from '@/lib/auth-helpers';
import { updateCompanySchema } from '@/lib/validations';
import { 
  handleApiError, 
  successResponse, 
  notFoundResponse,
  successWithMessage 
} from '@/lib/api-response';

// GET /api/companies/[id] - Get company by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireCompanyAccessApi(params.id);

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            avatar: true,
            isActive: true,
          },
        },
        targets: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            riskScore: true,
          },
        },
        pentests: {
          select: {
            id: true,
            title: true,
            status: true,
            progress: true,
            startDate: true,
            endDate: true,
          },
        },
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

    if (!company) {
      return notFoundResponse('Company');
    }

    return successResponse(company);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/companies/[id] - Update company
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only ADMIN can update companies
    await requireAdminApi();

    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    const company = await prisma.company.update({
      where: { id: params.id },
      data: validatedData,
    });

    return successWithMessage(company, 'Company updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/companies/[id] - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only ADMIN can delete companies
    await requireAdminApi();

    await prisma.company.delete({
      where: { id: params.id },
    });

    return successWithMessage(null, 'Company deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
