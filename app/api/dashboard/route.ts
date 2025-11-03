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

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const params = getQueryParams(request);
    
    // Get date range (default: last 30 days)
    const daysRange = parseInt(params.get('days') || '30');
    const startDate = startOfDay(subDays(new Date(), daysRange));
    const endDate = endOfDay(new Date());

    // Base where clause for company filtering
    const companyWhere = { companyId: user.companyId };

    // Fetch all statistics in parallel
    const [
      findingStats,
      pentestStats,
      targetStats,
      recentActivity,
      findingsByCategory,
      findingsTrend,
      complianceScores,
    ] = await Promise.all([
      // Finding statistics
      prisma.finding.groupBy({
        by: ['severity', 'status'],
        where: companyWhere,
        _count: true,
      }),
      
      // Pentest statistics
      prisma.pentest.groupBy({
        by: ['status'],
        where: companyWhere,
        _count: true,
      }),
      
      // Target statistics
      prisma.target.aggregate({
        where: companyWhere,
        _count: true,
        _avg: { riskScore: true },
      }),
      
      // Recent activity
      getRecentActivity(user.companyId, 10),
      
      // Findings by category
      prisma.finding.groupBy({
        by: ['category'],
        where: {
          ...companyWhere,
          category: { not: null },
        },
        _count: true,
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      
      // Findings trend (last 7 days)
      getFindingsTrend(user.companyId, 7),
      
      // Compliance scores (mock data for now)
      getComplianceScores(),
    ]);

    // Process finding statistics
    const severityCounts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0,
    };
    const statusCounts = {
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };
    
    findingStats.forEach(stat => {
      if (stat.severity) {
        severityCounts[stat.severity as keyof typeof severityCounts] = 
          (severityCounts[stat.severity as keyof typeof severityCounts] || 0) + stat._count;
      }
      if (stat.status) {
        statusCounts[stat.status as keyof typeof statusCounts] = 
          (statusCounts[stat.status as keyof typeof statusCounts] || 0) + stat._count;
      }
    });

    // Process pentest statistics
    const pentestStatusCounts = {
      SCHEDULED: 0,
      IN_PROGRESS: 0,
      REPORTED: 0,
      RESCAN: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    
    pentestStats.forEach(stat => {
      pentestStatusCounts[stat.status as keyof typeof pentestStatusCounts] = stat._count;
    });

    // High risk targets (risk score > 70)
    const highRiskTargets = await prisma.target.count({
      where: {
        ...companyWhere,
        riskScore: { gt: 70 },
      },
    });

    // Format response
    const dashboardStats = {
      findings: {
        total: Object.values(severityCounts).reduce((a, b) => a + b, 0),
        bySeverity: severityCounts,
        byStatus: statusCounts,
        openCritical: await prisma.finding.count({
          where: {
            ...companyWhere,
            severity: 'CRITICAL',
            status: 'OPEN',
          },
        }),
      },
      pentests: {
        total: Object.values(pentestStatusCounts).reduce((a, b) => a + b, 0),
        byStatus: pentestStatusCounts,
        active: pentestStatusCounts.IN_PROGRESS + pentestStatusCounts.SCHEDULED,
        completed: pentestStatusCounts.COMPLETED,
      },
      targets: {
        total: targetStats._count,
        averageRiskScore: Math.round(targetStats._avg.riskScore || 0),
        highRisk: highRiskTargets,
        active: await prisma.target.count({
          where: {
            ...companyWhere,
            status: 'ACTIVE',
          },
        }),
      },
      activity: recentActivity,
      findingsByCategory: findingsByCategory.map(cat => ({
        category: cat.category || 'Uncategorized',
        count: cat._count,
      })),
      findingsTrend,
      compliance: complianceScores,
      dateRange: {
        from: startDate,
        to: endDate,
        days: daysRange,
      },
    };

    return successResponse(dashboardStats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch dashboard statistics', 500);
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
