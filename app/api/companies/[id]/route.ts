import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin, canAccessCompany } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  updatedResponse,
  deletedResponse
} from '@/lib/api-response';
import { updateCompanySchema } from '@/lib/validations';

interface RouteParams {
  params: { id: string };
}

// GET /api/companies/[id] - Get single company
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;

    // Check access
    if (user.role !== 'ADMIN' && user.companyId !== id) {
      return forbiddenResponse('You can only view your own company');
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatar: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            pentests: true,
            targets: true,
            findings: true,
            reports: true,
            templates: true,
          },
        },
      },
    });

    if (!company) {
      return notFoundResponse('Company');
    }

    const responseData = {
      id: company.id,
      name: company.name,
      domain: company.domain,
      logo: company.logo,
      description: company.description,
      users: company.users,
      stats: {
        users: company.users.length,
        pentests: company._count.pentests,
        targets: company._count.targets,
        findings: company._count.findings,
        reports: company._count.reports,
        templates: company._count.templates,
      },
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    return successResponse(responseData);
  } catch (error) {
    console.error('Error fetching company:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to fetch company', 500);
  }
}

// PUT /api/companies/[id] - Update company (ADMIN only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = params;
    
    // Admin can only update their own company
    if (user.companyId !== id) {
      return forbiddenResponse('You can only update your own company');
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = updateCompanySchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      return notFoundResponse('Company');
    }

    const { name, domain, logo, description } = validationResult.data;

    // Check for duplicate name or domain (if changed)
    if (name && name !== existingCompany.name) {
      const duplicateName = await prisma.company.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          NOT: { id },
        },
      });
      
      if (duplicateName) {
        return errorResponse('Company with this name already exists', 409);
      }
    }

    if (domain && domain !== existingCompany.domain) {
      const duplicateDomain = await prisma.company.findFirst({
        where: {
          domain: { equals: domain, mode: 'insensitive' },
          NOT: { id },
        },
      });
      
      if (duplicateDomain) {
        return errorResponse('Company with this domain already exists', 409);
      }
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(domain !== undefined && { domain }),
        ...(logo !== undefined && { logo }),
        ...(description !== undefined && { description }),
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
      id: updatedCompany.id,
      name: updatedCompany.name,
      domain: updatedCompany.domain,
      logo: updatedCompany.logo,
      description: updatedCompany.description,
      stats: {
        users: updatedCompany._count.users,
        pentests: updatedCompany._count.pentests,
        targets: updatedCompany._count.targets,
        findings: updatedCompany._count.findings,
      },
      createdAt: updatedCompany.createdAt,
      updatedAt: updatedCompany.updatedAt,
    };

    return updatedResponse(responseData, 'Company updated successfully');
  } catch (error) {
    console.error('Error updating company:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to update company', 500);
  }
}

// DELETE /api/companies/[id] - Delete company (SUPER ADMIN only - not implemented)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // This would require a SUPER_ADMIN role which doesn't exist in our schema
    // For now, we'll prevent any company deletion
    return forbiddenResponse('Company deletion is not allowed');
    
    // If we wanted to implement this:
    /*
    const user = await requireAuth();
    
    if (user.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('Only super admins can delete companies');
    }

    const { id } = params;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!company) {
      return notFoundResponse('Company');
    }

    if (company._count.users > 0) {
      return errorResponse('Cannot delete company with active users', 400);
    }

    // Delete company (cascade will handle related records)
    await prisma.company.delete({
      where: { id },
    });

    return deletedResponse('Company deleted successfully');
    */
  } catch (error) {
    console.error('Error deleting company:', error);
    return errorResponse('Failed to delete company', 500);
  }
}
