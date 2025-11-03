import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePentester } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '@/lib/api-response';
import { generatePDF } from '@/lib/pdf-generator';
import { generateDOCX } from '@/lib/docx-generator';
import { generateHTML } from '@/lib/html-generator';
import { notificationTemplates, notifyCompanyUsers } from '@/lib/notifications';

interface ReportConfig {
  pentestId: string;
  reportType: 'executive' | 'technical' | 'compliance' | 'full';
  format: 'pdf' | 'docx' | 'html' | 'json';
  templateId?: string;
  title: string;
  includeExecutiveSummary: boolean;
  includeFindings: boolean;
  includeMethodology: boolean;
  includeRemediation: boolean;
  includeAppendices: boolean;
  findingSeverityFilter?: string[];
  findingStatusFilter?: string[];
  customSections?: string[];
  watermark?: boolean;
  confidential?: boolean;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePentester();
    const config: ReportConfig = await request.json();

    // Validate required fields
    if (!config.pentestId || !config.title) {
      return errorResponse('Pentest ID and title are required', 400);
    }

    // Fetch pentest with all related data
    const pentest = await prisma.pentest.findFirst({
      where: {
        id: config.pentestId,
        companyId: user.companyId,
      },
      include: {
        target: true,
        company: {
          select: {
            name: true,
            logo: true,
            domain: true,
          },
        },
        createdBy: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
        findings: {
          where: {
            AND: [
              config.findingSeverityFilter?.length 
                ? { severity: { in: config.findingSeverityFilter } }
                : {},
              config.findingStatusFilter?.length
                ? { status: { in: config.findingStatusFilter } }
                : {},
            ],
          },
          orderBy: [
            { severity: 'asc' },
            { cvssScore: 'desc' },
          ],
          include: {
            reporter: {
              select: {
                fullName: true,
                email: true,
              },
            },
            assignedTo: {
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
            reports: true,
          },
        },
      },
    });

    if (!pentest) {
      return errorResponse('Pentest not found or access denied', 404);
    }

    // Load template if specified
    let template = null;
    if (config.templateId) {
      template = await prisma.template.findFirst({
        where: {
          id: config.templateId,
          OR: [
            { companyId: user.companyId },
            { isPublic: true },
          ],
        },
      });
    }

    // Prepare report data
    const reportData = await prepareReportData(pentest, config, user, template);

    // Generate report file based on format
    let fileUrl: string;
    let fileSize: number;
    let filename: string;

    switch (config.format) {
      case 'pdf':
        const pdfResult = await generatePDF(reportData, config);
        fileUrl = pdfResult.url;
        fileSize = pdfResult.size;
        filename = pdfResult.filename;
        break;
        
      case 'docx':
        const docxResult = await generateDOCX(reportData, config);
        fileUrl = docxResult.url;
        fileSize = docxResult.size;
        filename = docxResult.filename;
        break;
        
      case 'html':
        const htmlResult = await generateHTML(reportData, config);
        fileUrl = htmlResult.url;
        fileSize = htmlResult.size;
        filename = htmlResult.filename;
        break;
        
      case 'json':
        // For JSON, we just return the data
        const jsonString = JSON.stringify(reportData, null, 2);
        fileSize = Buffer.byteLength(jsonString);
        filename = `report-${pentest.id}-${Date.now()}.json`;
        fileUrl = `/api/reports/download/${filename}`;
        // Store JSON temporarily
        await storeTemporaryFile(filename, jsonString);
        break;
        
      default:
        return errorResponse('Invalid report format', 400);
    }

    // Create report record in database
    const report = await prisma.report.create({
      data: {
        title: config.title,
        reportType: config.reportType.toUpperCase(),
        status: 'FINAL',
        format: config.format.toUpperCase(),
        fileUrl,
        pentestId: config.pentestId,
        companyId: user.companyId,
        generatedBy: user.id,
        generatedAt: new Date(),
      },
      include: {
        pentest: {
          select: {
            title: true,
            target: {
              select: {
                name: true,
              },
            },
          },
        },
        generator: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Send notification
    const notification = notificationTemplates.reportGenerated(report.title, report.id);
    await notifyCompanyUsers(user.companyId, notification, user.id);

    // Return report details
    return successResponse({
      id: report.id,
      title: report.title,
      reportType: report.reportType,
      format: report.format,
      fileUrl,
      filename,
      fileSize,
      pentest: report.pentest,
      generator: report.generator,
      generatedAt: report.generatedAt,
    }, 'Report generated successfully');

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

async function prepareReportData(
  pentest: any, 
  config: ReportConfig, 
  user: any,
  template: any
) {
  // Calculate statistics
  const findingsBySeverity = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0,
  };

  const findingsByStatus = {
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
  };

  const findingsByCategory: Record<string, number> = {};

  pentest.findings.forEach((finding: any) => {
    findingsBySeverity[finding.severity as keyof typeof findingsBySeverity]++;
    findingsByStatus[finding.status as keyof typeof findingsByStatus]++;
    
    if (finding.category) {
      findingsByCategory[finding.category] = (findingsByCategory[finding.category] || 0) + 1;
    }
  });

  const criticalAndHighCount = findingsBySeverity.CRITICAL + findingsBySeverity.HIGH;
  const averageCVSS = pentest.findings.length > 0
    ? pentest.findings.reduce((sum: number, f: any) => sum + f.cvssScore, 0) / pentest.findings.length
    : 0;

  // Calculate risk score
  let overallRiskScore = 0;
  const severityWeights = {
    CRITICAL: 10,
    HIGH: 7,
    MEDIUM: 4,
    LOW: 2,
    INFO: 1,
  };

  Object.entries(findingsBySeverity).forEach(([severity, count]) => {
    overallRiskScore += (count as number) * severityWeights[severity as keyof typeof severityWeights];
  });

  overallRiskScore = Math.min(100, Math.round(overallRiskScore));

  // Prepare report data structure
  const reportData = {
    metadata: {
      title: config.title,
      reportType: config.reportType,
      generatedAt: new Date(),
      generatedBy: user.fullName,
      company: pentest.company,
      confidential: config.confidential,
      watermark: config.watermark,
      language: config.language || 'en',
    },
    pentest: {
      id: pentest.id,
      title: pentest.title,
      description: pentest.description,
      status: pentest.status,
      startDate: pentest.startDate,
      endDate: pentest.endDate,
      methodology: pentest.methodology,
      createdBy: pentest.createdBy,
    },
    target: {
      id: pentest.target.id,
      name: pentest.target.name,
      type: pentest.target.type,
      url: pentest.target.url,
      ipAddress: pentest.target.ipAddress,
      description: pentest.target.description,
    },
    statistics: {
      totalFindings: pentest.findings.length,
      findingsBySeverity,
      findingsByStatus,
      findingsByCategory,
      criticalAndHighCount,
      averageCVSS: Math.round(averageCVSS * 10) / 10,
      overallRiskScore,
      testingDuration: Math.ceil(
        (new Date(pentest.endDate).getTime() - new Date(pentest.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ),
    },
    sections: {},
    findings: pentest.findings,
    template,
  };

  // Add sections based on configuration
  if (config.includeExecutiveSummary) {
    reportData.sections.executiveSummary = generateExecutiveSummary(reportData);
  }

  if (config.includeMethodology) {
    reportData.sections.methodology = generateMethodologySection(pentest);
  }

  if (config.includeFindings) {
    reportData.sections.findings = generateFindingsSection(pentest.findings);
  }

  if (config.includeRemediation) {
    reportData.sections.remediation = generateRemediationSection(pentest.findings);
  }

  if (config.includeAppendices) {
    reportData.sections.appendices = generateAppendices(reportData);
  }

  return reportData;
}

function generateExecutiveSummary(data: any) {
  const riskLevel = data.statistics.overallRiskScore >= 70 ? 'High' :
                    data.statistics.overallRiskScore >= 40 ? 'Medium' : 'Low';

  return {
    overview: `This report presents the findings from the security assessment of ${data.target.name} conducted from ${new Date(data.pentest.startDate).toLocaleDateString()} to ${new Date(data.pentest.endDate).toLocaleDateString()}.`,
    scope: `The assessment covered ${data.target.type} security testing of the ${data.target.name} system.`,
    keyFindings: {
      total: data.statistics.totalFindings,
      critical: data.statistics.findingsBySeverity.CRITICAL,
      high: data.statistics.findingsBySeverity.HIGH,
      riskLevel,
      averageCVSS: data.statistics.averageCVSS,
    },
    recommendations: generateRecommendations(data.statistics),
    conclusion: `The assessment identified ${data.statistics.totalFindings} security findings with an overall risk score of ${data.statistics.overallRiskScore}/100. Immediate attention is recommended for the ${data.statistics.criticalAndHighCount} critical and high severity findings.`,
  };
}

function generateMethodologySection(pentest: any) {
  return {
    approach: pentest.methodology || 'OWASP Testing Guide',
    phases: [
      'Reconnaissance and Information Gathering',
      'Vulnerability Identification',
      'Exploitation and Verification',
      'Post-Exploitation Analysis',
      'Reporting and Documentation',
    ],
    tools: [
      'Burp Suite Professional',
      'OWASP ZAP',
      'Nmap',
      'Metasploit',
      'Custom Scripts',
    ],
    standards: [
      'OWASP Top 10',
      'NIST Cybersecurity Framework',
      'ISO 27001/27002',
      'PCI DSS (if applicable)',
    ],
  };
}

function generateFindingsSection(findings: any[]) {
  const groupedFindings = {
    critical: findings.filter(f => f.severity === 'CRITICAL'),
    high: findings.filter(f => f.severity === 'HIGH'),
    medium: findings.filter(f => f.severity === 'MEDIUM'),
    low: findings.filter(f => f.severity === 'LOW'),
    info: findings.filter(f => f.severity === 'INFO'),
  };

  return Object.entries(groupedFindings).map(([severity, items]) => ({
    severity: severity.toUpperCase(),
    count: items.length,
    findings: items.map(finding => ({
      id: finding.id,
      title: finding.title,
      description: finding.description,
      cvssScore: finding.cvssScore,
      category: finding.category,
      status: finding.status,
      proofOfConcept: finding.proofOfConcept,
      reproductionSteps: finding.reproductionSteps,
      remediation: finding.remediation,
      references: finding.references,
      reporter: finding.reporter,
      assignedTo: finding.assignedTo,
    })),
  }));
}

function generateRemediationSection(findings: any[]) {
  const remediationPriority = [
    {
      priority: 'Immediate (24-48 hours)',
      findings: findings.filter(f => f.severity === 'CRITICAL'),
      description: 'Critical vulnerabilities requiring immediate attention',
    },
    {
      priority: 'High (1 week)',
      findings: findings.filter(f => f.severity === 'HIGH'),
      description: 'High severity issues that should be addressed urgently',
    },
    {
      priority: 'Medium (1 month)',
      findings: findings.filter(f => f.severity === 'MEDIUM'),
      description: 'Medium severity vulnerabilities requiring planned remediation',
    },
    {
      priority: 'Low (3 months)',
      findings: findings.filter(f => f.severity === 'LOW' || f.severity === 'INFO'),
      description: 'Lower priority issues for long-term security improvement',
    },
  ];

  return {
    timeline: remediationPriority,
    summary: generateRemediationSummary(findings),
    bestPractices: [
      'Implement a secure software development lifecycle (SDLC)',
      'Conduct regular security assessments',
      'Maintain an up-to-date asset inventory',
      'Implement security awareness training',
      'Establish incident response procedures',
    ],
  };
}

function generateRemediationSummary(findings: any[]) {
  const categories = new Set(findings.map(f => f.category).filter(Boolean));
  const summaries: any[] = [];

  categories.forEach(category => {
    const categoryFindings = findings.filter(f => f.category === category);
    summaries.push({
      category,
      count: categoryFindings.length,
      recommendation: getGenericRemediation(category as string),
    });
  });

  return summaries;
}

function getGenericRemediation(category: string): string {
  const remediations: Record<string, string> = {
    'SQL Injection': 'Implement parameterized queries and input validation',
    'Cross-Site Scripting (XSS)': 'Encode output and implement Content Security Policy',
    'Authentication Bypass': 'Strengthen authentication mechanisms and implement MFA',
    'Authorization Flaws': 'Implement proper access controls and role-based permissions',
    'Information Disclosure': 'Remove sensitive information from responses and error messages',
    'Configuration Issues': 'Review and harden server and application configurations',
  };

  return remediations[category] || 'Implement appropriate security controls';
}

function generateRecommendations(statistics: any): string[] {
  const recommendations = [];

  if (statistics.findingsBySeverity.CRITICAL > 0) {
    recommendations.push('Address all critical vulnerabilities immediately');
  }

  if (statistics.findingsBySeverity.HIGH > 0) {
    recommendations.push('Prioritize remediation of high-severity findings');
  }

  if (statistics.averageCVSS > 7) {
    recommendations.push('Implement a vulnerability management program');
  }

  recommendations.push(
    'Conduct regular security assessments',
    'Implement security monitoring and logging',
    'Provide security training to development team'
  );

  return recommendations;
}

function generateAppendices(data: any) {
  return {
    glossary: {
      CVSS: 'Common Vulnerability Scoring System',
      OWASP: 'Open Web Application Security Project',
      XSS: 'Cross-Site Scripting',
      SQL: 'Structured Query Language',
      API: 'Application Programming Interface',
    },
    references: [
      'OWASP Top 10 - https://owasp.org/www-project-top-ten/',
      'NIST Cybersecurity Framework - https://www.nist.gov/cyberframework',
      'CWE - Common Weakness Enumeration - https://cwe.mitre.org/',
    ],
    tools: [
      'Burp Suite Professional v2024.1',
      'OWASP ZAP 2.14.0',
      'Nmap 7.94',
    ],
    disclaimer: 'This report contains confidential information and should be handled accordingly. The findings represent a point-in-time assessment and may not reflect the current security posture.',
  };
}

async function storeTemporaryFile(filename: string, content: string) {
  // In production, this would store the file in a proper storage service
  // For now, we'll store it temporarily in memory or file system
  console.log(`Storing temporary file: ${filename}`);
}
