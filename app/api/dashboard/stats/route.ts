import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.companyId;

    // Get statistics in parallel
    const [
      criticalFindings,
      activePentests,
      highRiskTargets,
      totalFindings,
      openFindings,
      resolvedFindings,
      recentActivity,
    ] = await Promise.all([
      // Critical findings count
      prisma.finding.count({
        where: {
          companyId,
          severity: 'CRITICAL',
          status: 'OPEN',
        },
      }),

      // Active pentests count
      prisma.pentest.count({
        where: {
          companyId,
          status: 'IN_PROGRESS',
        },
      }),

      // High risk targets count
      prisma.target.count({
        where: {
          companyId,
          criticalityLevel: {
            in: ['CRITICAL', 'HIGH'],
          },
          isActive: true,
        },
      }),

      // Total findings count
      prisma.finding.count({
        where: {
          companyId,
        },
      }),

      // Open findings count
      prisma.finding.count({
        where: {
          companyId,
          status: 'OPEN',
        },
      }),

      // Resolved findings count
      prisma.finding.count({
        where: {
          companyId,
          status: 'RESOLVED',
        },
      }),

      // Recent activity
      prisma.activityLog.findMany({
        where: {
          user: {
            companyId,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ]);

    // Get severity distribution
    const severityDistribution = await prisma.finding.groupBy({
      by: ['severity'],
      where: {
        companyId,
      },
      _count: {
        severity: true,
      },
    });

    // Get findings by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const findingsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::int as count
      FROM "Finding"
      WHERE "companyId" = ${companyId}
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // Get pentest progress
    const pentests = await prisma.pentest.findMany({
      where: {
        companyId,
        status: {
          not: 'ARCHIVED',
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        progress: true,
        startDate: true,
        endDate: true,
      },
      orderBy: {
        startDate: 'desc',
      },
      take: 5,
    });

    const stats = {
      criticalFindings,
      activePentests,
      highRiskTargets,
      totalFindings,
      openFindings,
      resolvedFindings,
      severityDistribution: severityDistribution.map((item) => ({
        name: item.severity,
        value: item._count.severity,
      })),
      findingsByMonth,
      recentActivity,
      pentests,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
