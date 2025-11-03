import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePentester } from '@/lib/auth-helpers';
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
import { createFindingSchema, filterFindingsSchema } from '@/lib/validations';
import { notificationTemplates, notifyPentestTeam, createNotification } from '@/lib/notifications';

// GET /api/findings - List findings with filters
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const params = getQueryParams(request);
    const { page, limit, skip } = getPaginationParams(params);
    const { sortBy, sortOrder } = getSortParams(params);
    
    // Parse filters
    const filters = {
      severity: params.get('severity'),
      status: params.get('status'),
      pentestId: params.get('pentestId'),
      targetId: params.get('targetId'),
      assignedToId: params.get('assignedToId'),
      category: params.get('category'),
      query: params.get('query'),
    };

    // Build where clause
    const where: any = { companyId: user.companyId };

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.pentestId) {
      where.pentestId = filters.pentestId;
    }

    if (filters.targetId) {
      where.targetId = filters.targetId;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { category: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Get findings with related data
    const [findings, total] = await Promise.all([
      prisma.finding.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy === 'severity' 
          ? [{ severity: 'asc' }, { createdAt: sortOrder }]
          : { [sortBy]: sortOrder },
        include: {
          pentest: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          target: {
            select: {
              id: true,
              name: true,
              type: true,
              url: true,
            },
          },
          reporter: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.finding.count({ where }),
    ]);

    // Format response with additional metadata
    const formattedFindings = findings.map(finding => ({
      id: finding.id,
      title: finding.title,
      description: finding.description,
      severity: finding.severity,
      cvssScore: finding.cvssScore,
      status: finding.status,
      category: finding.category,
      pentest: finding.pentest,
      target: finding.target,
      reporter: finding.reporter,
      assignedTo: finding.assignedTo,
      evidence: {
        hasProofOfConcept: !!finding.proofOfConcept,
        hasReproductionSteps: !!finding.reproductionSteps,
        hasRequestExample: !!finding.requestExample,
        hasResponseExample: !!finding.responseExample,
        evidenceImagesCount: finding.evidenceImages.length,
      },
      remediation: {
        hasRemediation: !!finding.remediation,
        hasRemediationCode: !!finding.remediationCode,
        referencesCount: finding.references.length,
      },
      stats: {
        comments: finding._count.comments,
      },
      createdAt: finding.createdAt,
      updatedAt: finding.updatedAt,
    }));

    return paginatedResponse(formattedFindings, page, limit, total);
  } catch (error) {
    console.error('Error fetching findings:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch findings', 500);
  }
}

// POST /api/findings - Create new finding
export async function POST(request: NextRequest) {
  try {
    const user = await requirePentester();
    const body = await request.json();
    
    // Validate input
    const validationResult = createFindingSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const data = validationResult.data;

    // Verify pentest exists and user has access
    const pentest = await prisma.pentest.findFirst({
      where: {
        id: data.pentestId,
        companyId: user.companyId,
        status: { in: ['IN_PROGRESS', 'REPORTED'] },
      },
    });

    if (!pentest) {
      return errorResponse('Pentest not found or not in progress', 404);
    }

    // Verify target exists and matches pentest
    const target = await prisma.target.findFirst({
      where: {
        id: data.targetId,
        companyId: user.companyId,
      },
    });

    if (!target) {
      return errorResponse('Target not found', 404);
    }

    if (pentest.targetId !== data.targetId) {
      return errorResponse('Target does not match pentest', 400);
    }

    // Verify assignee if provided
    if (data.assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: data.assignedToId,
          companyId: user.companyId,
          role: { in: ['ADMIN', 'PENTESTER'] },
        },
      });

      if (!assignee) {
        return errorResponse('Invalid assignee', 400);
      }
    }

    // Create finding
    const finding = await prisma.finding.create({
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity,
        cvssScore: data.cvssScore,
        status: data.status || 'OPEN',
        category: data.category,
        proofOfConcept: data.proofOfConcept,
        reproductionSteps: data.reproductionSteps,
        requestExample: data.requestExample,
        responseExample: data.responseExample,
        evidenceImages: data.evidenceImages || [],
        remediation: data.remediation,
        remediationCode: data.remediationCode,
        references: data.references || [],
        pentestId: data.pentestId,
        targetId: data.targetId,
        companyId: user.companyId,
        reporterId: user.id,
        assignedToId: data.assignedToId,
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

    // Update target risk score based on new finding
    await updateTargetRiskScore(data.targetId);

    // Send notifications
    const notification = notificationTemplates.findingCreated(
      finding.severity,
      finding.title,
      finding.id
    );
    
    // Notify pentest team
    await notifyPentestTeam(pentest.id, notification, user.id);
    
    // If assigned, notify assignee
    if (finding.assignedToId && finding.assignedToId !== user.id) {
      const assignNotification = notificationTemplates.findingAssigned(
        finding.title,
        finding.id
      );
      await createNotification({
        userId: finding.assignedToId,
        ...assignNotification,
      });
    }

    const responseData = {
      id: finding.id,
      title: finding.title,
      description: finding.description,
      severity: finding.severity,
      cvssScore: finding.cvssScore,
      status: finding.status,
      category: finding.category,
      pentest: finding.pentest,
      target: finding.target,
      reporter: finding.reporter,
      assignedTo: finding.assignedTo,
      createdAt: finding.createdAt,
    };

    return createdResponse(responseData, 'Finding created successfully');
  } catch (error) {
    console.error('Error creating finding:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to create finding', 500);
  }
}

// Helper function to update target risk score
async function updateTargetRiskScore(targetId: string) {
  // Calculate risk score based on findings
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

  // Update target
  await prisma.target.update({
    where: { id: targetId },
    data: { riskScore },
  });
}
