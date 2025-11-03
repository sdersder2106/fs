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
import { createTargetSchema, filterTargetsSchema } from '@/lib/validations';
import { notificationTemplates, createNotification } from '@/lib/notifications';

// GET /api/targets - List targets with filters
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const params = getQueryParams(request);
    const { page, limit, skip } = getPaginationParams(params);
    const { sortBy, sortOrder } = getSortParams(params);
    
    // Parse filters
    const filters = {
      type: params.get('type'),
      status: params.get('status'),
      minRiskScore: params.get('minRiskScore'),
      maxRiskScore: params.get('maxRiskScore'),
      query: params.get('query'),
    };

    // Build where clause
    const where: any = { companyId: user.companyId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.minRiskScore || filters.maxRiskScore) {
      where.riskScore = {};
      if (filters.minRiskScore) {
        where.riskScore.gte = parseInt(filters.minRiskScore);
      }
      if (filters.maxRiskScore) {
        where.riskScore.lte = parseInt(filters.maxRiskScore);
      }
    }

    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { url: { contains: filters.query, mode: 'insensitive' } },
        { ipAddress: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Get targets with related counts
    const [targets, total] = await Promise.all([
      prisma.target.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              pentests: true,
              findings: true,
            },
          },
        },
      }),
      prisma.target.count({ where }),
    ]);

    // Get additional stats for each target
    const targetsWithStats = await Promise.all(
      targets.map(async (target) => {
        // Get latest pentest
        const latestPentest = await prisma.pentest.findFirst({
          where: { targetId: target.id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            progress: true,
          },
        });

        // Count open findings by severity
        const openFindings = await prisma.finding.groupBy({
          by: ['severity'],
          where: {
            targetId: target.id,
            status: 'OPEN',
          },
          _count: true,
        });

        const openFindingsBySeverity = {
          CRITICAL: 0,
          HIGH: 0,
          MEDIUM: 0,
          LOW: 0,
          INFO: 0,
        };

        openFindings.forEach(group => {
          openFindingsBySeverity[group.severity as keyof typeof openFindingsBySeverity] = group._count;
        });

        return {
          id: target.id,
          name: target.name,
          type: target.type,
          url: target.url,
          ipAddress: target.ipAddress,
          description: target.description,
          status: target.status,
          riskScore: target.riskScore,
          scope: target.scope,
          stats: {
            totalPentests: target._count.pentests,
            totalFindings: target._count.findings,
            openFindings: openFindingsBySeverity,
            latestPentest,
          },
          createdAt: target.createdAt,
          updatedAt: target.updatedAt,
        };
      })
    );

    return paginatedResponse(targetsWithStats, page, limit, total);
  } catch (error) {
    console.error('Error fetching targets:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch targets', 500);
  }
}

// POST /api/targets - Create new target
export async function POST(request: NextRequest) {
  try {
    const user = await requirePentester();
    const body = await request.json();
    
    // Validate input
    const validationResult = createTargetSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const { 
      name, 
      type, 
      url, 
      ipAddress, 
      description, 
      status, 
      riskScore,
      scope 
    } = validationResult.data;

    // Check for duplicate target
    const existingTarget = await prisma.target.findFirst({
      where: {
        companyId: user.companyId,
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          ...(url ? [{ url: { equals: url, mode: 'insensitive' } }] : []),
          ...(ipAddress ? [{ ipAddress }] : []),
        ],
      },
    });

    if (existingTarget) {
      return errorResponse('A target with this name, URL, or IP address already exists', 409);
    }

    // Create target
    const target = await prisma.target.create({
      data: {
        name,
        type,
        url,
        ipAddress,
        description,
        status: status || 'ACTIVE',
        riskScore: riskScore || 0,
        scope,
        companyId: user.companyId,
      },
    });

    // Send notification
    const notification = notificationTemplates.targetAdded(target.name, target.id);
    await createNotification({
      userId: user.id,
      ...notification,
    });

    // Calculate initial risk score if not provided
    if (riskScore === undefined || riskScore === 0) {
      // This is a simplified risk calculation
      // In production, this would be more sophisticated
      let calculatedRisk = 0;
      
      if (type === 'WEB_APP' || type === 'API') calculatedRisk += 30;
      if (type === 'NETWORK' || type === 'HOST') calculatedRisk += 40;
      if (type === 'MOBILE_APP') calculatedRisk += 20;
      if (type === 'CLOUD') calculatedRisk += 35;
      
      // Update with calculated risk
      await prisma.target.update({
        where: { id: target.id },
        data: { riskScore: calculatedRisk },
      });
      
      target.riskScore = calculatedRisk;
    }

    const responseData = {
      id: target.id,
      name: target.name,
      type: target.type,
      url: target.url,
      ipAddress: target.ipAddress,
      description: target.description,
      status: target.status,
      riskScore: target.riskScore,
      scope: target.scope,
      createdAt: target.createdAt,
    };

    return createdResponse(responseData, 'Target created successfully');
  } catch (error) {
    console.error('Error creating target:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to create target', 500);
  }
}
