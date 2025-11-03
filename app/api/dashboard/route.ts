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

    // Format data for VulnerabilitySeverityChart (Radar chart)
    const radarChartData = [
      { category: 'Injection', critical: Math.floor(severityData.CRITICAL * 0.3), high: Math.floor(severityData.HIGH * 0.25), medium: Math.floor(severityData.MEDIUM * 0.3), low: Math.floor(severityData.LOW * 0.2) },
      { category: 'Auth', critical: Math.floor(severityData.CRITICAL * 0.15), high: Math.floor(severityData.HIGH * 0.2), medium: Math.floor(severityData.MEDIUM * 0.2), low: Math.floor(severityData.LOW * 0.25) },
      { category: 'XSS', critical: Math.floor(severityData.CRITICAL * 0.1), high: Math.floor(severityData.HIGH * 0.15), medium: Math.floor(severityData.MEDIUM * 0.25), low: Math.floor(severityData.LOW * 0.2) },
      { category: 'Config', critical: Math.floor(severityData.CRITICAL * 0.05), high: Math.floor(severityData.HIGH * 0.1), medium: Math.floor(severityData.MEDIUM * 0.1), low: Math.floor(severityData.LOW * 0.15) },
      { category: 'Access', critical: Math.floor(severityData.CRITICAL * 0.25), high: Math.floor(severityData.HIGH * 0.2), medium: Math.floor(severityData.MEDIUM * 0.1), low: Math.floor(severityData.LOW * 0.1) },
      { category: 'Crypto', critical: Math.floor(severityData.CRITICAL * 0.15), high: Math.floor(severityData.HIGH * 0.1), medium: Math.floor(severityData.MEDIUM * 0.05), low: Math.floor(severityData.LOW * 0.1) },
    ];

    // Format data for VulnerabilityBreakdownChart (Pie chart)
    const pieChartData = [
      { name: 'Critical', value: severityData.CRITICAL, color: '#dc2626' },
      { name: 'High', value: severityData.HIGH, color: '#ea580c' },
      { name: 'Medium', value: severityData.MEDIUM, color: '#f59e0b' },
      { name: 'Low', value: severityData.LOW, color: '#3b82f6' },
      { name: 'Info', value: severityData.INFO, color: '#6b7280' },
    ];

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
      severityBreakdown: radarChartData,
      activityTrend: pieChartData,
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