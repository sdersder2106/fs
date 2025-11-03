import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return unauthorizedResponse();
    }

    const { user } = authResult;
    
    // OPTIMIZED: Only get counts, no full data
    const [
      criticalFindings,
      activePentests,
      highRiskTargets,
      totalFindings,
      completedPentests
    ] = await Promise.all([
      prisma.finding.count({
        where: {
          companyId: user.companyId!,
          severity: 'CRITICAL',
          status: 'OPEN'
        }
      }),
      prisma.pentest.count({
        where: {
          companyId: user.companyId!,
          status: 'ACTIVE'
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
    ]);

    // Get only LAST 5 findings for activity
    const recentFindings = await prisma.finding.findMany({
      where: {
        companyId: user.companyId!
      },
      select: {
        id: true,
        title: true,
        severity: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5 // Only 5 items!
    });

    // Simple severity breakdown
    const severityBreakdown = await prisma.finding.groupBy({
      by: ['severity'],
      where: {
        companyId: user.companyId!,
        status: 'OPEN'
      },
      _count: true
    });

    const severityData: any = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0
    };
    
    severityBreakdown.forEach((item) => {
      severityData[item.severity] = item._count;
    });

    // Return minimal data
    return successResponse({
      stats: {
        criticalFindings,
        activePentests,
        highRiskTargets,
        totalFindings,
        completedPentests
      },
      recentFindings,
      severityBreakdown: severityData,
      complianceStatus: {
        percentage: 92,
        compliant: 92,
        total: 100
      }
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return errorResponse('Failed to fetch dashboard data');
  }
}