import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { handleApiError, successResponse } from '@/lib/api-response';

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(request.url);
    
    const companyId = searchParams.get('companyId') || user.companyId;

    // Build where clause based on role
    const where: any = {};
    if (user.role === 'CLIENT' && user.companyId) {
      where.companyId = user.companyId;
    } else if (companyId) {
      where.companyId = companyId;
    }

    // Get counts
    const [
      totalPentests,
      activePentests,
      totalTargets,
      activeTargets,
      totalFindings,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
      infoFindings,
      openFindings,
    ] = await Promise.all([
      // Total pentests
      prisma.pentest.count({ where }),
      
      // Active pentests (IN_PROGRESS)
      prisma.pentest.count({
        where: { ...where, status: 'IN_PROGRESS' },
      }),
      
      // Total targets
      prisma.target.count({ where }),
      
      // Active targets
      prisma.target.count({
        where: { ...where, status: 'ACTIVE' },
      }),
      
      // Total findings
      prisma.finding.count({ where }),
      
      // Critical findings
      prisma.finding.count({
        where: { ...where, severity: 'CRITICAL' },
      }),
      
      // High findings
      prisma.finding.count({
        where: { ...where, severity: 'HIGH' },
      }),
      
      // Medium findings
      prisma.finding.count({
        where: { ...where, severity: 'MEDIUM' },
      }),
      
      // Low findings
      prisma.finding.count({
        where: { ...where, severity: 'LOW' },
      }),
      
      // Info findings
      prisma.finding.count({
        where: { ...where, severity: 'INFO' },
      }),
      
      // Open findings
      prisma.finding.count({
        where: { ...where, status: 'OPEN' },
      }),
    ]);

    // Get findings by category
    const findingsByCategory = await prisma.finding.groupBy({
      by: ['category'],
      where,
      _count: true,
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 10,
    });

    // Get findings by severity (for chart)
    const findingsBySeverity = [
      { severity: 'CRITICAL', count: criticalFindings },
      { severity: 'HIGH', count: highFindings },
      { severity: 'MEDIUM', count: mediumFindings },
      { severity: 'LOW', count: lowFindings },
      { severity: 'INFO', count: infoFindings },
    ];

    // Get recent activity (last 10 items)
    const recentFindings = await prisma.finding.findMany({
      where,
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        severity: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    const recentComments = await prisma.comment.findMany({
      where: {
        OR: [
          { pentest: { ...where } },
          { finding: { ...where } },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        text: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        finding: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Build activity feed
    const activity = [
      ...recentFindings.map((f) => ({
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
      })),
      ...recentComments.map((c) => ({
        id: c.id,
        type: 'comment' as const,
        title: 'New Comment',
        description: c.finding?.title || 'On pentest',
        time: c.createdAt,
        user: {
          name: c.author.fullName,
          avatar: c.author.avatar,
        },
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    const stats = {
      totalPentests,
      activePentests,
      totalTargets,
      activeTargets,
      totalVulnerabilities: totalFindings,
      openVulnerabilities: openFindings,
      criticalVulnerabilities: criticalFindings,
      highVulnerabilities: highFindings,
      mediumVulnerabilities: mediumFindings,
      lowVulnerabilities: lowFindings,
      infoVulnerabilities: infoFindings,
      findingsByCategory: findingsByCategory.map((item) => ({
        category: item.category || 'Uncategorized',
        count: item._count,
      })),
      findingsBySeverity,
      recentActivity: activity,
    };

    return successResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
