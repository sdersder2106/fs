import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePentester } from '@/lib/auth-helpers';
import { handleApiError, successResponse } from '@/lib/api-response';
import { generatePDF } from '@/lib/pdf-generator';
import { notificationTemplates, notifyCompanyUsers } from '@/lib/notifications';

// POST /api/reports/generate - Generate a report
export async function POST(request: NextRequest) {
  try {
    await requirePentester();
    
    const body = await request.json();
    const { pentestId, title, type = 'FULL' } = body;

    if (!pentestId) {
      throw new Error('Pentest ID is required');
    }

    // Get pentest data
    const pentest = await prisma.pentest.findUnique({
      where: { id: pentestId },
      include: {
        company: true,
        findings: {
          include: {
            target: true,
            reporter: true,
          },
        },
        targets: true,
      },
    });

    if (!pentest) {
      throw new Error('Pentest not found');
    }

    // Create report record
    const report = await prisma.report.create({
      data: {
        title: title || `${pentest.title} - Report`,
        type,
        status: 'DRAFT',
        pentestId,
        generatedAt: new Date(),
        content: {
          summary: `Report for ${pentest.title}`,
          findings: pentest.findings.length,
          targets: pentest.targets.length,
        },
      },
    });

    // Generate PDF (stub for now)
    try {
      const pdfBuffer = await generatePDF({
        title: report.title,
        company: pentest.company?.name,
        date: new Date(),
        content: pentest.findings,
      });
      
      // In a real app, you would upload this to a storage service
      console.log('PDF generated, size:', pdfBuffer.length);
    } catch (pdfError) {
      console.warn('PDF generation skipped:', pdfError);
    }

    // Send notifications
    if (pentest.companyId) {
      await notifyCompanyUsers(pentest.companyId, {
        type: notificationTemplates.REPORT_GENERATED.type,
        title: notificationTemplates.REPORT_GENERATED.title,
        message: notificationTemplates.REPORT_GENERATED.getMessage(report.title),
        link: `/dashboard/reports/${report.id}`,
        metadata: { reportId: report.id, pentestId },
      });
    }

    return successResponse(report, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
