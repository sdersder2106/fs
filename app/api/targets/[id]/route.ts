import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePentester } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  updatedResponse,
  deletedResponse
} from '@/lib/api-response';
import { updateTargetSchema } from '@/lib/validations';
import { notificationTemplates, createNotification } from '@/lib/notifications';

interface RouteParams {
  params: { id: string };
}

// GET /api/targets/[id] - Get single target with details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const target = await prisma.target.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
      include: {
        pentests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                findings: true,
              },
            },
          },
        },
        findings: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          orderBy: { severity: 'asc' },
          take: 10,
          include: {
            reporter: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
              },
            },
            pentest: {
              select: {
                id: true,
                title: true,
              },
            },
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

    if (!target) {
      return notFoundResponse('Target');
    }

    // Calculate vulnerability statistics
    const vulnerabilityStats = await prisma.finding.groupBy({
      by: ['severity', 'status'],
      where: { targetId: id },
      _count: true,
    });

    const stats = {
      bySeverity: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
        INFO: 0,
      },
      byStatus: {
        OPEN: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
        CLOSED: 0,
      },
    };

    vulnerabilityStats.forEach(stat => {
      if (stat.severity) {
        stats.bySeverity[stat.severity as keyof typeof stats.bySeverity] += stat._count;
      }
      if (stat.status) {
        stats.byStatus[stat.status as keyof typeof stats.byStatus] += stat._count;
      }
    });

    // Calculate risk score trend (simplified)
    const riskTrend = await calculateRiskTrend(id);

    // Format response
    const responseData = {
      ...target,
      vulnerabilityStats: stats,
      riskTrend,
      recentPentests: target.pentests.map(p => ({
        ...p,
        findingsCount: p._count.findings,
      })),
      activeFindings: target.findings,
    };

    return successResponse(responseData);
  } catch (error) {
    console.error('Error fetching target:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch target', 500);
  }
}

// PUT /api/targets/[id] - Update target
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePentester();
    const { id } = params;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateTargetSchema.safeParse({ ...body, id });
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    // Check if target exists
    const existingTarget = await prisma.target.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
    });

    if (!existingTarget) {
      return notFoundResponse('Target');
    }

    const {
      name,
      type,
      url,
      ipAddress,
      description,
      status,
      riskScore,
      scope,
    } = validationResult.data;

    // Check for duplicate if changing identifiers
    if (name && name !== existingTarget.name ||
        url && url !== existingTarget.url ||
        ipAddress && ipAddress !== existingTarget.ipAddress) {
      
      const duplicate = await prisma.target.findFirst({
        where: {
          companyId: user.companyId,
          NOT: { id },
          OR: [
            ...(name ? [{ name: { equals: name, mode: 'insensitive' } }] : []),
            ...(url ? [{ url: { equals: url, mode: 'insensitive' } }] : []),
            ...(ipAddress ? [{ ipAddress }] : []),
          ],
        },
      });

      if (duplicate) {
        return errorResponse('A target with this name, URL, or IP address already exists', 409);
      }
    }

    // Track risk score changes for notifications
    const riskChanged = riskScore !== undefined && riskScore !== existingTarget.riskScore;
    const riskIncreased = riskChanged && riskScore > existingTarget.riskScore && riskScore >= 80;

    // Update target
    const updatedTarget = await prisma.target.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(url !== undefined && { url }),
        ...(ipAddress !== undefined && { ipAddress }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(riskScore !== undefined && { riskScore }),
        ...(scope !== undefined && { scope }),
      },
      include: {
        _count: {
          select: {
            pentests: true,
            findings: true,
          },
        },
      },
    });

    // Send notification if risk increased significantly
    if (riskIncreased) {
      const notification = notificationTemplates.targetRiskChanged(
        updatedTarget.name,
        updatedTarget.riskScore,
        updatedTarget.id
      );
      
      // Notify admins and pentesters
      const adminsAndPentesters = await prisma.user.findMany({
        where: {
          companyId: user.companyId,
          role: { in: ['ADMIN', 'PENTESTER'] },
        },
        select: { id: true },
      });

      await Promise.all(
        adminsAndPentesters.map(u => 
          createNotification({ userId: u.id, ...notification })
        )
      );
    }

    const responseData = {
      id: updatedTarget.id,
      name: updatedTarget.name,
      type: updatedTarget.type,
      url: updatedTarget.url,
      ipAddress: updatedTarget.ipAddress,
      description: updatedTarget.description,
      status: updatedTarget.status,
      riskScore: updatedTarget.riskScore,
      scope: updatedTarget.scope,
      stats: {
        pentests: updatedTarget._count.pentests,
        findings: updatedTarget._count.findings,
      },
      updatedAt: updatedTarget.updatedAt,
    };

    return updatedResponse(responseData, 'Target updated successfully');
  } catch (error) {
    console.error('Error updating target:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to update target', 500);
  }
}

// DELETE /api/targets/[id] - Delete target
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePentester();
    const { id } = params;

    // Check if target exists
    const target = await prisma.target.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
      include: {
        _count: {
          select: {
            pentests: true,
            findings: true,
          },
        },
      },
    });

    if (!target) {
      return notFoundResponse('Target');
    }

    // Only admins can delete targets
    if (user.role !== 'ADMIN') {
      return forbiddenResponse('Only admins can delete targets');
    }

    // Prevent deletion if there are pentests or findings
    if (target._count.pentests > 0) {
      return errorResponse('Cannot delete target with existing pentests', 400);
    }

    if (target._count.findings > 0) {
      return errorResponse('Cannot delete target with existing findings', 400);
    }

    // Delete target
    await prisma.target.delete({
      where: { id },
    });

    return deletedResponse('Target deleted successfully');
  } catch (error) {
    console.error('Error deleting target:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to delete target', 500);
  }
}

// Helper function to calculate risk trend
async function calculateRiskTrend(targetId: string) {
  // This is a simplified risk trend calculation
  // In production, this would analyze historical data
  
  const recentFindings = await prisma.finding.findMany({
    where: {
      targetId,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    },
    select: {
      severity: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by week
  const weeks: Record<string, number> = {};
  
  recentFindings.forEach(finding => {
    const weekKey = getWeekKey(finding.createdAt);
    if (!weeks[weekKey]) weeks[weekKey] = 0;
    
    // Weight by severity
    const weight = {
      CRITICAL: 10,
      HIGH: 7,
      MEDIUM: 4,
      LOW: 2,
      INFO: 1,
    }[finding.severity] || 1;
    
    // Reduce weight if resolved
    const statusMultiplier = finding.status === 'RESOLVED' || finding.status === 'CLOSED' ? 0.2 : 1;
    
    weeks[weekKey] += weight * statusMultiplier;
  });

  return Object.entries(weeks).map(([week, score]) => ({
    week,
    riskScore: Math.min(100, score * 5), // Scale to 0-100
  }));
}

function getWeekKey(date: Date): string {
  const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
  return `Week ${week}`;
}
