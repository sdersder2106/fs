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
import { updateFindingSchema } from '@/lib/validations';
import { notificationTemplates, createNotification, notifyPentestTeam } from '@/lib/notifications';

interface RouteParams {
  params: { id: string };
}

// GET /api/findings/[id] - Get single finding with full details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const finding = await prisma.finding.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
      include: {
        pentest: {
          include: {
            target: true,
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        target: true,
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!finding) {
      return notFoundResponse('Finding');
    }

    // Get related findings (same category or target)
    const relatedFindings = await prisma.finding.findMany({
      where: {
        companyId: user.companyId,
        NOT: { id },
        OR: [
          { category: finding.category },
          { targetId: finding.targetId },
        ],
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
      take: 5,
      orderBy: { severity: 'asc' },
      select: {
        id: true,
        title: true,
        severity: true,
        status: true,
        category: true,
      },
    });

    // Format response with all details
    const responseData = {
      ...finding,
      relatedFindings,
      stats: {
        commentsCount: finding.comments.length,
        daysSinceCreated: Math.floor(
          (Date.now() - finding.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
        isOverdue: finding.status === 'OPEN' && 
          Math.floor((Date.now() - finding.createdAt.getTime()) / (1000 * 60 * 60 * 24)) > 30,
      },
    };

    return successResponse(responseData);
  } catch (error) {
    console.error('Error fetching finding:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch finding', 500);
  }
}

// PUT /api/findings/[id] - Update finding
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePentester();
    const { id } = params;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateFindingSchema.safeParse({ ...body, id });
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    // Check if finding exists
    const existingFinding = await prisma.finding.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
      include: {
        assignedTo: true,
      },
    });

    if (!existingFinding) {
      return notFoundResponse('Finding');
    }

    // Only reporter, assignee, and admins can update
    if (existingFinding.reporterId !== user.id && 
        existingFinding.assignedToId !== user.id && 
        user.role !== 'ADMIN') {
      return forbiddenResponse('You do not have permission to update this finding');
    }

    const data = validationResult.data;

    // Track changes for notifications
    const statusChanged = data.status && data.status !== existingFinding.status;
    const wasResolved = statusChanged && data.status === 'RESOLVED';
    const wasClosed = statusChanged && data.status === 'CLOSED';
    const assigneeChanged = data.assignedToId && data.assignedToId !== existingFinding.assignedToId;

    // Verify new assignee if changed
    if (assigneeChanged) {
      const newAssignee = await prisma.user.findFirst({
        where: {
          id: data.assignedToId,
          companyId: user.companyId,
          role: { in: ['ADMIN', 'PENTESTER'] },
        },
      });

      if (!newAssignee) {
        return errorResponse('Invalid assignee', 400);
      }
    }

    // Update finding
    const updatedFinding = await prisma.finding.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.severity && { severity: data.severity }),
        ...(data.cvssScore !== undefined && { cvssScore: data.cvssScore }),
        ...(data.status && { status: data.status }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.proofOfConcept !== undefined && { proofOfConcept: data.proofOfConcept }),
        ...(data.reproductionSteps !== undefined && { reproductionSteps: data.reproductionSteps }),
        ...(data.requestExample !== undefined && { requestExample: data.requestExample }),
        ...(data.responseExample !== undefined && { responseExample: data.responseExample }),
        ...(data.evidenceImages !== undefined && { evidenceImages: data.evidenceImages }),
        ...(data.remediation !== undefined && { remediation: data.remediation }),
        ...(data.remediationCode !== undefined && { remediationCode: data.remediationCode }),
        ...(data.references !== undefined && { references: data.references }),
        ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
      },
      include: {
        pentest: {
          select: {
            id: true,
            title: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
          },
        },
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Update target risk score if severity changed
    if (data.severity && data.severity !== existingFinding.severity) {
      await updateTargetRiskScore(updatedFinding.targetId);
    }

    // Send notifications
    if (wasResolved) {
      const notification = notificationTemplates.findingResolved(
        updatedFinding.title,
        updatedFinding.id
      );
      await notifyPentestTeam(updatedFinding.pentestId, notification, user.id);
    } else if (statusChanged) {
      const notification = notificationTemplates.findingStatusChanged(
        updatedFinding.title,
        updatedFinding.status,
        updatedFinding.id
      );
      await notifyPentestTeam(updatedFinding.pentestId, notification, user.id);
    }

    if (assigneeChanged && data.assignedToId) {
      const notification = notificationTemplates.findingAssigned(
        updatedFinding.title,
        updatedFinding.id
      );
      await createNotification({
        userId: data.assignedToId,
        ...notification,
      });
    }

    const responseData = {
      id: updatedFinding.id,
      title: updatedFinding.title,
      description: updatedFinding.description,
      severity: updatedFinding.severity,
      cvssScore: updatedFinding.cvssScore,
      status: updatedFinding.status,
      category: updatedFinding.category,
      pentest: updatedFinding.pentest,
      target: updatedFinding.target,
      reporter: updatedFinding.reporter,
      assignedTo: updatedFinding.assignedTo,
      updatedAt: updatedFinding.updatedAt,
    };

    return updatedResponse(responseData, 'Finding updated successfully');
  } catch (error) {
    console.error('Error updating finding:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to update finding', 500);
  }
}

// DELETE /api/findings/[id] - Delete finding
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePentester();
    const { id } = params;

    // Check if finding exists
    const finding = await prisma.finding.findFirst({
      where: { 
        id,
        companyId: user.companyId,
      },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!finding) {
      return notFoundResponse('Finding');
    }

    // Only reporter and admins can delete
    if (finding.reporterId !== user.id && user.role !== 'ADMIN') {
      return forbiddenResponse('Only the reporter or admins can delete this finding');
    }

    // Prevent deletion if status is RESOLVED or CLOSED
    if (finding.status === 'RESOLVED' || finding.status === 'CLOSED') {
      return errorResponse('Cannot delete resolved or closed findings', 400);
    }

    // Delete finding (cascade will handle comments)
    await prisma.finding.delete({
      where: { id },
    });

    // Update target risk score
    await updateTargetRiskScore(finding.targetId);

    return deletedResponse('Finding deleted successfully');
  } catch (error) {
    console.error('Error deleting finding:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to delete finding', 500);
  }
}

// Helper function to update target risk score
async function updateTargetRiskScore(targetId: string) {
  const findings = await prisma.finding.findMany({
    where: {
      targetId,
      status: { in: ['OPEN', 'IN_PROGRESS'] },
    },
    select: {
      severity: true,
      cvssScore: true,
    },
  });

  let riskScore = 0;
  const severityWeights = {
    CRITICAL: 20,
    HIGH: 15,
    MEDIUM: 10,
    LOW: 5,
    INFO: 2,
  };

  findings.forEach(finding => {
    const severityWeight = severityWeights[finding.severity as keyof typeof severityWeights] || 0;
    const cvssMultiplier = finding.cvssScore / 10;
    riskScore += severityWeight * cvssMultiplier;
  });

  // Normalize to 0-100
  riskScore = Math.min(100, Math.round(riskScore));

  await prisma.target.update({
    where: { id: targetId },
    data: { riskScore },
  });
}
