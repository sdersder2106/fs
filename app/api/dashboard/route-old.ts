import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  getQueryParams
} from '@/lib/api-response';
import { subDays, startOfDay, endOfDay } from 'date-fns';

// Force dynamic rendering with Edge Runtime for better performance
export const runtime = 'nodejs'; // Use 'edge' for simpler queries
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add caching headers
const setCacheHeaders = (response: NextResponse, maxAge: number = 60) => {
  response.headers.set('Cache-Control', `s-maxage=${maxAge}, stale-while-revalidate=59`);
  return response;
};

export async function GET(request: NextRequest) {
  try {
    // Auth check with early return
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return unauthorizedResponse();
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';
    const days = parseInt(period);
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Parallel database queries with optimized selects
    const [
      stats,
      recentFindings,
      severityBreakdown,
      complianceStatus,
      activityData
    ] = await Promise.all([
      // Basic stats - use count for performance
      Promise.all([
        prisma.pentest.count({
          where: {
            companyId: user.companyId!,
            status: 'ACTIVE'
          }
        }),
        prisma.finding.count({
          where: {
            companyId: user.companyId!,
            severity: 'CRITICAL',
            status: 'OPEN'
          }
        }),
        prisma.target.count({
          where: {
            companyId: user.companyId!,
            risk: 'HIGH'
          }
        }),
        prisma.finding.count({
          where: {
            companyId: user.companyId!,
            status: 'OPEN'
          }
        }),
        prisma.pentest.count({
          where: {
            companyId: user.companyId!,
            status: 'COMPLETED'
          }
        })
      ]),
      
      // Recent findings - limit fields for performance
      prisma.finding.findMany({
        where: {
          companyId: user.companyId!,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
          createdAt: true,
          pentest: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Severity breakdown - use groupBy for efficiency
      prisma.finding.groupBy({
        by: ['severity'],
        where: {
          companyId: user.companyId!,
          status: 'OPEN'
        },
        _count: true
      }),
      
      // Compliance status
      prisma.finding.groupBy({
        by: ['complianceStatus'],
        where: {
          companyId: user.companyId!
        },
        _count: true
      }),
      
      // Activity trend data - aggregate by day
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          severity
        FROM "Finding"
        WHERE company_id = ${user.companyId}
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        GROUP BY DATE(created_at), severity
        ORDER BY date ASC
      `
    ]);

    // Format the response
    const formattedStats = {
      activePentests: stats[0],
      criticalFindings: stats[1],
      highRiskTargets: stats[2],
      totalFindings: stats[3],
      completedPentests: stats[4]
    };

    // Format severity breakdown
    const severityData = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0
    };
    
    severityBreakdown.forEach((item) => {
      severityData[item.severity] = item._count;
    });

    // Calculate compliance percentage
    let compliancePercentage = 0;
    let totalCompliance = 0;
    let compliantCount = 0;
    
    complianceStatus.forEach((item) => {
      totalCompliance += item._count;
      if (item.complianceStatus === 'COMPLIANT') {
        compliantCount = item._count;
      }
    });
    
    if (totalCompliance > 0) {
      compliancePercentage = Math.round((compliantCount / totalCompliance) * 100);
    }

    // Prepare response data
    const dashboardData = {
      stats: formattedStats,
      recentFindings,
      severityBreakdown: severityData,
      complianceStatus: {
        percentage: compliancePercentage,
        compliant: compliantCount,
        total: totalCompliance
      },
      activityTrend: activityData,
      lastUpdated: new Date().toISOString()
    };

    // Return with cache headers
    const response = successResponse(dashboardData);
    return setCacheHeaders(response, 60); // Cache for 60 seconds
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return errorResponse('Failed to fetch dashboard data');
  }
}

async function getRecentActivity(companyId: string, limit: number = 10) {
  const activities = [];

  // Get recent findings
  const recentFindings = await prisma.finding.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      reporter: {
        select: { fullName: true, avatar: true },
      },
    },
  });

  recentFindings.forEach(finding => {
    activities.push({
      id: finding.id,
      type: 'finding' as const,
      action: 'created' as const,
      title: finding.title,
      description: `New ${finding.severity} finding reported`,
      user: {
        name: finding.reporter.fullName,
        avatar: finding.reporter.avatar,
      },
      timestamp: finding.createdAt,
      link: `/dashboard/findings/${finding.id}`,
      metadata: {
        severity: finding.severity,
        status: finding.status,
      },
    });
  });

  // Get recent pentests
  const recentPentests = await prisma.pentest.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: limit / 2,
    include: {
      createdBy: {
        select: { fullName: true, avatar: true },
      },
    },
  });

  recentPentests.forEach(pentest => {
    activities.push({
      id: pentest.id,
      type: 'pentest' as const,
      action: pentest.status === 'COMPLETED' ? 'completed' as const : 'created' as const,
      title: pentest.title,
      description: `Pentest ${pentest.status.toLowerCase()}`,
      user: {
        name: pentest.createdBy.fullName,
        avatar: pentest.createdBy.avatar,
      },
      timestamp: pentest.createdAt,
      link: `/dashboard/pentests/${pentest.id}`,
      metadata: {
        status: pentest.status,
      },
    });
  });

  // Sort by timestamp and limit
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

async function getFindingsTrend(companyId: string, days: number) {
  const trend = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const findings = await prisma.finding.groupBy({
      by: ['severity'],
      where: {
        companyId,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _count: true,
    });

    const dayCounts = {
      date: dayStart.toISOString().split('T')[0],
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      total: 0,
    };

    findings.forEach(f => {
      const severity = f.severity.toLowerCase() as keyof typeof dayCounts;
      if (severity in dayCounts && severity !== 'date' && severity !== 'total') {
        dayCounts[severity] = f._count;
        dayCounts.total += f._count;
      }
    });

    trend.push(dayCounts);
  }

  return trend;
}

function getComplianceScores() {
  // Mock compliance scores - in production, these would be calculated
  // based on actual compliance checks and findings
  return [
    {
      standard: 'SOC2',
      status: 'compliant' as const,
      score: 92,
      details: 'All controls implemented and tested',
    },
    {
      standard: 'PCI-DSS',
      status: 'partial' as const,
      score: 78,
      details: '3 critical controls pending implementation',
    },
    {
      standard: 'ISO27001',
      status: 'compliant' as const,
      score: 88,
      details: 'Certification valid until 2025',
    },
    {
      standard: 'GDPR',
      status: 'compliant' as const,
      score: 95,
      details: 'Full compliance achieved',
    },
    {
      standard: 'HIPAA',
      status: 'non-compliant' as const,
      score: 45,
      details: 'Not applicable for current operations',
    },
    {
      standard: 'OWASP',
      status: 'partial' as const,
      score: 82,
      details: 'Top 10 risks partially mitigated',
    },
  ];
}
