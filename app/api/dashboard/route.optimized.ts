import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { handleApiError, successResponse } from '@/lib/api-response';

// Cache for dashboard stats (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
const statsCache = new Map<string, { data: any; timestamp: number }>();

// GET /api/dashboard - Get dashboard statistics (optimized)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(request.url);
    
    const companyId = searchParams.get('companyId') || user.companyId;
    const useCache = searchParams.get('cache') !== 'false';
    
    // Generate cache key
    const cacheKey = `dashboard-${user.id}-${companyId || 'all'}`;
    
    // Check cache first
    if (useCache) {
      const cached = statsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-TTL': String(Math.round((CACHE_TTL - (Date.now() - cached.timestamp)) / 1000)),
          },
        });
      }
    }

    // Build where clause based on role
    const where: any = {};
    if (user.role === 'CLIENT' && user.companyId) {
      where.companyId = user.companyId;
    } else if (companyId) {
      where.companyId = companyId;
    }

    // Optimize queries with selective fields and parallel execution
    const [
      counts,
      findingsByCategory,
      recentActivity
    ] = await Promise.all([
      // Combined count query (single database roundtrip)
      getOptimizedCounts(where),
      
      // Findings by category (limited to top 5)
      prisma.finding.groupBy({
        by: ['category'],
        where,
        _count: true,
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
        take: 5, // Reduced from 10 to 5
      }),
      
      // Recent activity (optimized)
      getRecentActivity(where, 5), // Reduced from 10 to 5
    ]);

    // Build response
    const stats = {
      // Counts
      totalPentests: counts.totalPentests,
      activePentests: counts.activePentests,
      totalTargets: counts.totalTargets,
      activeTargets: counts.activeTargets,
      totalVulnerabilities: counts.totalFindings,
      openVulnerabilities: counts.openFindings,
      
      // Severity breakdown
      criticalVulnerabilities: counts.criticalFindings,
      highVulnerabilities: counts.highFindings,
      mediumVulnerabilities: counts.mediumFindings,
      lowVulnerabilities: counts.lowFindings,
      infoVulnerabilities: counts.infoFindings,
      
      // Categories
      findingsByCategory: findingsByCategory.map((item) => ({
        category: item.category || 'Uncategorized',
        count: item._count,
      })),
      
      // Severity chart data
      findingsBySeverity: [
        { severity: 'CRITICAL', count: counts.criticalFindings },
        { severity: 'HIGH', count: counts.highFindings },
        { severity: 'MEDIUM', count: counts.mediumFindings },
        { severity: 'LOW', count: counts.lowFindings },
        { severity: 'INFO', count: counts.infoFindings },
      ],
      
      // Recent activity
      recentActivity,
    };

    // Update cache
    statsCache.set(cacheKey, {
      data: stats,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    if (statsCache.size > 100) {
      const oldestKey = Array.from(statsCache.keys())[0];
      statsCache.delete(oldestKey);
    }

    return NextResponse.json(stats, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Optimized count queries using raw SQL for better performance
async function getOptimizedCounts(where: any) {
  const companyFilter = where.companyId ? `WHERE "companyId" = '${where.companyId}'` : '';
  
  // Use raw query for better performance
  const result = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      (SELECT COUNT(*) FROM "Pentest" ${companyFilter}) as "totalPentests",
      (SELECT COUNT(*) FROM "Pentest" ${companyFilter ? companyFilter + ' AND' : 'WHERE'} status = 'IN_PROGRESS') as "activePentests",
      (SELECT COUNT(*) FROM "Target" ${companyFilter}) as "totalTargets",
      (SELECT COUNT(*) FROM "Target" ${companyFilter ? companyFilter + ' AND' : 'WHERE'} status = 'ACTIVE') as "activeTargets",
      (SELECT COUNT(*) FROM "Finding" ${companyFilter}) as "totalFindings",
      (SELECT COUNT(*) FROM "Finding" ${companyFilter ? companyFilter + ' AND' : 'WHERE'} severity = 'CRITICAL') as "criticalFindings",
      (SELECT COUNT(*) FROM "Finding" ${companyFilter ? companyFilter + ' AND' : 'WHERE'} severity = 'HIGH') as "highFindings",
      (SELECT COUNT(*) FROM "Finding" ${companyFilter ? companyFilter + ' AND' : 'WHERE'} severity = 'MEDIUM') as "mediumFindings",
      (SELECT COUNT(*) FROM "Finding" ${companyFilter ? companyFilter + ' AND' : 'WHERE'} severity = 'LOW') as "lowFindings",
      (SELECT COUNT(*) FROM "Finding" ${companyFilter ? companyFilter + ' AND' : 'WHERE'} severity = 'INFO') as "infoFindings",
      (SELECT COUNT(*) FROM "Finding" ${companyFilter ? companyFilter + ' AND' : 'WHERE'} status = 'OPEN') as "openFindings"
  `);
  
  return {
    totalPentests: Number(result[0]?.totalPentests || 0),
    activePentests: Number(result[0]?.activePentests || 0),
    totalTargets: Number(result[0]?.totalTargets || 0),
    activeTargets: Number(result[0]?.activeTargets || 0),
    totalFindings: Number(result[0]?.totalFindings || 0),
    criticalFindings: Number(result[0]?.criticalFindings || 0),
    highFindings: Number(result[0]?.highFindings || 0),
    mediumFindings: Number(result[0]?.mediumFindings || 0),
    lowFindings: Number(result[0]?.lowFindings || 0),
    infoFindings: Number(result[0]?.infoFindings || 0),
    openFindings: Number(result[0]?.openFindings || 0),
  };
}

// Optimized recent activity query
async function getRecentActivity(where: any, limit: number) {
  // Get recent findings (limited fields)
  const recentFindings = await prisma.finding.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      severity: true,
      createdAt: true,
      reporter: {
        select: {
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  // Transform to activity format
  return recentFindings.map((f) => ({
    id: f.id,
    type: 'vulnerability' as const,
    title: 'New Vulnerability Found',
    description: f.title,
    time: f.createdAt,
    severity: f.severity,
    user: {
      name: f.reporter.fullName,
      avatar: f.reporter.avatar,
    },
  }));
}
