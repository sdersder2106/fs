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
import { createReportSchema } from '@/lib/validations';
import { notificationTemplates, notifyCompanyUsers } from '@/lib/notifications';

// GET /api/reports - List reports
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const params = getQueryParams(request);
    const { page, limit, skip } = getPaginationParams(params);
    const { sortBy, sortOrder } = getSortParams(params);
    
    // Parse filters
    const filters = {
      pentestId: params.get('pentestId'),
      reportType: params.get('reportType'),
      status: params.get('status'),
      format: params.get('format'),
      query: params.get('query'),
    };

    // Build where clause
    const where: any = { companyId: user.companyId };

    if (filters.pentestId) {
      where.pentestId = filters.pentestId;
    }

    if (filters.reportType) {
      where.reportType = filters.reportType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.format) {
      where.format = filters.format;
    }

    if (filters.query) {
      where.title = { contains: filters.query, mode: 'insensitive' };
    }

    // Get reports with related data
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          pentest: {
            select: {
              id: true,
              title: true,
              status: true,
              target: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          generator: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    // Format response
    const formattedReports = reports.map(report => ({
      id: report.id,
      title: report.title,
      reportType: report.reportType,
      status: report.status,
      format: report.format,
      fileUrl: report.fileUrl,
      pentest: report.pentest,
      generator: report.generator,
      generatedAt: report.generatedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }));

    return paginatedResponse(formattedReports, page, limit, total);
  } catch (error) {
    console.error('Error fetching reports:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch reports', 500);
  }
}

// POST /api/reports - Generate new report
export async function POST(request: NextRequest) {
  try {
    const user = await requirePentester();
    const body = await request.json();
    
    // Validate input
    const validationResult = createReportSchema.safeParse({
      ...body,
      companyId: user.companyId,
      generatedBy: user.id,
    });
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const { title, reportType, status, format, pentestId } = validationResult.data;

    // Verify pentest exists and belongs to user's company
    const pentest = await prisma.pentest.findFirst({
      where: {
        id: pentestId,
        companyId: user.companyId,
      },
      include: {
        target: true,
        findings: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] } },
          include: {
            reporter: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            findings: true,
          },
        },
      },
    });

    if (!pentest) {
      return errorResponse('Pentest not found or access denied', 404);
    }

    // Generate report content based on type
    const reportContent = await generateReportContent(pentest, reportType);

    // Create report record
    const report = await prisma.report.create({
      data: {
        title,
        reportType,
        status: status || 'DRAFT',
        format,
        fileUrl: null, // Will be updated after file generation
        pentestId,
        companyId: user.companyId,
        generatedBy: user.id,
        generatedAt: new Date(),
      },
      include: {
        pentest: {
          select: {
            id: true,
            title: true,
            target: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        generator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Generate actual report file (simplified - in production, use a proper document generator)
    const fileUrl = await generateReportFile(report, reportContent, format);

    // Update report with file URL
    const updatedReport = await prisma.report.update({
      where: { id: report.id },
      data: { fileUrl },
    });

    // Send notification
    const notification = notificationTemplates.reportGenerated(report.title, report.id);
    await notifyCompanyUsers(user.companyId, notification, user.id);

    const responseData = {
      id: report.id,
      title: report.title,
      reportType: report.reportType,
      status: report.status,
      format: report.format,
      fileUrl,
      pentest: report.pentest,
      generator: report.generator,
      generatedAt: report.generatedAt,
      createdAt: report.createdAt,
    };

    return createdResponse(responseData, 'Report generated successfully');
  } catch (error) {
    console.error('Error generating report:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
      if (error.message === 'Forbidden') {
        return forbiddenResponse();
      }
    }
    
    return errorResponse('Failed to generate report', 500);
  }
}

// Helper function to generate report content
async function generateReportContent(pentest: any, reportType: string) {
  const findingsBySeverity = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0,
  };

  pentest.findings.forEach((finding: any) => {
    findingsBySeverity[finding.severity as keyof typeof findingsBySeverity]++;
  });

  const content: any = {
    pentestTitle: pentest.title,
    targetName: pentest.target.name,
    startDate: pentest.startDate,
    endDate: pentest.endDate,
    status: pentest.status,
    totalFindings: pentest._count.findings,
    findingsBySeverity,
  };

  if (reportType === 'EXECUTIVE') {
    // Executive summary - high level overview
    content.executiveSummary = `
      Security assessment of ${pentest.target.name} was conducted from 
      ${pentest.startDate.toLocaleDateString()} to ${pentest.endDate.toLocaleDateString()}.
      A total of ${pentest._count.findings} vulnerabilities were identified.
    `;
    content.keyRisks = pentest.findings
      .filter((f: any) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
      .slice(0, 5)
      .map((f: any) => ({
        title: f.title,
        severity: f.severity,
        impact: f.description,
      }));
    content.recommendations = generateRecommendations(findingsBySeverity);
  } else if (reportType === 'TECHNICAL') {
    // Technical report - detailed findings
    content.methodology = pentest.methodology || 'OWASP Testing Guide';
    content.detailedFindings = pentest.findings.map((f: any) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      cvssScore: f.cvssScore,
      description: f.description,
      proofOfConcept: f.proofOfConcept,
      remediation: f.remediation,
      references: f.references,
    }));
  } else {
    // Full report - everything
    content.executiveSummary = `Complete security assessment report`;
    content.methodology = pentest.methodology || 'OWASP Testing Guide';
    content.findings = pentest.findings;
    content.recommendations = generateRecommendations(findingsBySeverity);
  }

  return content;
}

// Helper function to generate recommendations
function generateRecommendations(findingsBySeverity: any) {
  const recommendations = [];
  
  if (findingsBySeverity.CRITICAL > 0) {
    recommendations.push({
      priority: 'IMMEDIATE',
      action: 'Address all critical vulnerabilities immediately',
      timeline: 'Within 24-48 hours',
    });
  }
  
  if (findingsBySeverity.HIGH > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Remediate high-severity findings',
      timeline: 'Within 1 week',
    });
  }
  
  if (findingsBySeverity.MEDIUM > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Plan remediation for medium-severity issues',
      timeline: 'Within 1 month',
    });
  }
  
  recommendations.push({
    priority: 'ONGOING',
    action: 'Implement regular security testing',
    timeline: 'Quarterly',
  });
  
  return recommendations;
}

// Helper function to generate report file
async function generateReportFile(report: any, content: any, format: string): Promise<string> {
  // In production, this would use a proper document generation library
  // (e.g., puppeteer for PDF, docx for Word, etc.)
  
  const timestamp = Date.now();
  const filename = `report-${report.id}-${timestamp}.${format.toLowerCase()}`;
  const fileUrl = `/reports/${filename}`;
  
  // Simulate file generation
  // In production: 
  // - PDF: Use puppeteer or similar
  // - DOCX: Use docx library
  // - HTML: Generate HTML template
  
  console.log(`Generated ${format} report:`, filename);
  console.log('Report content:', content);
  
  return fileUrl;
}
