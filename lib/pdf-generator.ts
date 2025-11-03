import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF types for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface ReportData {
  metadata: any;
  pentest: any;
  target: any;
  statistics: any;
  sections: any;
  findings: any[];
}

interface ReportConfig {
  watermark?: boolean;
  confidential?: boolean;
  language?: string;
}

export async function generatePDF(data: ReportData, config: ReportConfig) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set document properties
  doc.setProperties({
    title: data.metadata.title,
    subject: `Security Assessment Report - ${data.target.name}`,
    author: data.metadata.generatedBy,
    keywords: 'security, pentest, assessment, vulnerability',
    creator: 'Base44 Security Platform',
  });

  // Add fonts and colors
  const primaryColor = '#4F46E5'; // Indigo
  const secondaryColor = '#6B7280'; // Gray
  const criticalColor = '#DC2626';
  const highColor = '#F97316';
  const mediumColor = '#F59E0B';
  const lowColor = '#3B82F6';
  const infoColor = '#6B7280';

  let currentPage = 1;
  let yPosition = 20;

  // Helper function to add page header
  const addPageHeader = () => {
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(data.metadata.company.name, 20, 10);
    doc.text(`Page ${currentPage}`, doc.internal.pageSize.width - 30, 10);
    
    if (config.confidential) {
      doc.setTextColor(220, 38, 38);
      doc.text('CONFIDENTIAL', doc.internal.pageSize.width / 2, 10, { align: 'center' });
    }
    
    doc.setDrawColor(200);
    doc.line(20, 15, doc.internal.pageSize.width - 20, 15);
    yPosition = 25;
  };

  // Helper function to add page footer
  const addPageFooter = () => {
    const footerY = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${new Date(data.metadata.generatedAt).toLocaleDateString()}`,
      20,
      footerY
    );
    doc.text(
      'Base44 Security Platform',
      doc.internal.pageSize.width - 20,
      footerY,
      { align: 'right' }
    );
  };

  // Helper function to add watermark
  const addWatermark = () => {
    if (config.watermark) {
      doc.setTextColor(200);
      doc.setFontSize(60);
      doc.setFont('helvetica', 'bold');
      const text = config.confidential ? 'CONFIDENTIAL' : 'DRAFT';
      doc.text(
        text,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height / 2,
        {
          align: 'center',
          angle: 45,
        }
      );
      // Reset font
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
    }
  };

  // Title Page
  addWatermark();
  
  // Company logo (if available)
  if (data.metadata.company.logo) {
    try {
      // In production, fetch and add the actual logo
      // doc.addImage(logoData, 'PNG', 20, 30, 40, 20);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Report title
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text(data.metadata.title, doc.internal.pageSize.width / 2, 80, { align: 'center' });

  // Subtitle
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor);
  doc.text(
    `${data.target.name} Security Assessment`,
    doc.internal.pageSize.width / 2,
    95,
    { align: 'center' }
  );

  // Report type badge
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(79, 70, 229); // Indigo
  const reportTypeText = data.metadata.reportType.toUpperCase();
  const textWidth = doc.getTextWidth(reportTypeText) + 10;
  doc.roundedRect(
    (doc.internal.pageSize.width - textWidth) / 2,
    105,
    textWidth,
    10,
    3,
    3,
    'F'
  );
  doc.text(reportTypeText, doc.internal.pageSize.width / 2, 111, { align: 'center' });

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(`Generated: ${new Date(data.metadata.generatedAt).toLocaleDateString()}`, doc.internal.pageSize.width / 2, 130, { align: 'center' });
  doc.text(`By: ${data.metadata.generatedBy}`, doc.internal.pageSize.width / 2, 137, { align: 'center' });
  doc.text(`Company: ${data.metadata.company.name}`, doc.internal.pageSize.width / 2, 144, { align: 'center' });

  // Add footer to first page
  addPageFooter();

  // Table of Contents
  doc.addPage();
  currentPage++;
  addPageHeader();
  addWatermark();

  doc.setFontSize(18);
  doc.setTextColor(primaryColor);
  doc.text('Table of Contents', 20, yPosition);
  yPosition += 15;

  const tocItems = [
    { title: 'Executive Summary', page: 3 },
    { title: 'Assessment Overview', page: 4 },
    { title: 'Key Statistics', page: 5 },
    { title: 'Findings Summary', page: 6 },
    { title: 'Detailed Findings', page: 8 },
    { title: 'Remediation Recommendations', page: 20 },
    { title: 'Appendices', page: 25 },
  ];

  doc.setFontSize(12);
  tocItems.forEach((item) => {
    doc.setTextColor(0);
    doc.text(item.title, 25, yPosition);
    doc.setTextColor(secondaryColor);
    doc.text(item.page.toString(), doc.internal.pageSize.width - 30, yPosition, { align: 'right' });
    
    // Add dots
    const dotsWidth = doc.internal.pageSize.width - 60 - doc.getTextWidth(item.title);
    const dots = '.'.repeat(Math.floor(dotsWidth / 1.5));
    doc.text(dots, 25 + doc.getTextWidth(item.title) + 2, yPosition);
    
    yPosition += 8;
  });

  addPageFooter();

  // Executive Summary
  if (data.sections.executiveSummary) {
    doc.addPage();
    currentPage++;
    addPageHeader();
    addWatermark();

    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(0);
    
    // Overview
    const lines = doc.splitTextToSize(data.sections.executiveSummary.overview, doc.internal.pageSize.width - 40);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 10;

    // Key findings box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, yPosition, doc.internal.pageSize.width - 40, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('Key Findings', 30, yPosition + 8);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total Issues: ${data.sections.executiveSummary.keyFindings.total}`, 30, yPosition + 16);
    doc.text(`Critical: ${data.sections.executiveSummary.keyFindings.critical}`, 80, yPosition + 16);
    doc.text(`High: ${data.sections.executiveSummary.keyFindings.high}`, 120, yPosition + 16);
    doc.text(`Risk Level: ${data.sections.executiveSummary.keyFindings.riskLevel}`, 30, yPosition + 24);
    doc.text(`Average CVSS: ${data.sections.executiveSummary.keyFindings.averageCVSS}`, 80, yPosition + 24);

    yPosition += 50;

    // Recommendations
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('Key Recommendations', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0);
    data.sections.executiveSummary.recommendations.forEach((rec: string, index: number) => {
      doc.text(`${index + 1}. ${rec}`, 25, yPosition);
      yPosition += 7;
    });

    addPageFooter();
  }

  // Statistics Page
  doc.addPage();
  currentPage++;
  addPageHeader();
  addWatermark();

  doc.setFontSize(18);
  doc.setTextColor(primaryColor);
  doc.text('Assessment Statistics', 20, yPosition);
  yPosition += 15;

  // Severity Distribution Table
  const severityData = [
    ['Severity', 'Count', 'Percentage'],
    ['Critical', data.statistics.findingsBySeverity.CRITICAL.toString(), 
      `${Math.round((data.statistics.findingsBySeverity.CRITICAL / data.statistics.totalFindings) * 100)}%`],
    ['High', data.statistics.findingsBySeverity.HIGH.toString(),
      `${Math.round((data.statistics.findingsBySeverity.HIGH / data.statistics.totalFindings) * 100)}%`],
    ['Medium', data.statistics.findingsBySeverity.MEDIUM.toString(),
      `${Math.round((data.statistics.findingsBySeverity.MEDIUM / data.statistics.totalFindings) * 100)}%`],
    ['Low', data.statistics.findingsBySeverity.LOW.toString(),
      `${Math.round((data.statistics.findingsBySeverity.LOW / data.statistics.totalFindings) * 100)}%`],
    ['Info', data.statistics.findingsBySeverity.INFO.toString(),
      `${Math.round((data.statistics.findingsBySeverity.INFO / data.statistics.totalFindings) * 100)}%`],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [severityData[0]],
    body: severityData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Status Distribution
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text('Finding Status Distribution', 20, yPosition);
  yPosition += 10;

  const statusData = [
    ['Status', 'Count'],
    ['Open', data.statistics.findingsByStatus.OPEN.toString()],
    ['In Progress', data.statistics.findingsByStatus.IN_PROGRESS.toString()],
    ['Resolved', data.statistics.findingsByStatus.RESOLVED.toString()],
    ['Closed', data.statistics.findingsByStatus.CLOSED.toString()],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [statusData[0]],
    body: statusData.slice(1),
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: 20, right: 20 },
  });

  addPageFooter();

  // Detailed Findings
  if (data.sections.findings) {
    doc.addPage();
    currentPage++;
    addPageHeader();
    addWatermark();

    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text('Detailed Findings', 20, yPosition);
    yPosition += 10;

    // Group findings by severity
    data.sections.findings.forEach((severityGroup: any) => {
      if (severityGroup.findings.length === 0) return;

      // Add new page if needed
      if (yPosition > doc.internal.pageSize.height - 50) {
        addPageFooter();
        doc.addPage();
        currentPage++;
        addPageHeader();
        addWatermark();
      }

      // Severity header
      doc.setFontSize(14);
      const severityColor = {
        'CRITICAL': criticalColor,
        'HIGH': highColor,
        'MEDIUM': mediumColor,
        'LOW': lowColor,
        'INFO': infoColor,
      }[severityGroup.severity] || secondaryColor;
      
      doc.setTextColor(severityColor);
      doc.text(`${severityGroup.severity} Severity Findings (${severityGroup.count})`, 20, yPosition);
      yPosition += 10;

      // Each finding
      severityGroup.findings.forEach((finding: any, index: number) => {
        // Check if we need a new page
        if (yPosition > doc.internal.pageSize.height - 80) {
          addPageFooter();
          doc.addPage();
          currentPage++;
          addPageHeader();
          addWatermark();
        }

        // Finding title
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${finding.title}`, 25, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 7;

        // CVSS Score
        if (finding.cvssScore) {
          doc.setFontSize(9);
          doc.setTextColor(secondaryColor);
          doc.text(`CVSS: ${finding.cvssScore}`, 30, yPosition);
          yPosition += 5;
        }

        // Description
        doc.setFontSize(9);
        doc.setTextColor(0);
        const descLines = doc.splitTextToSize(finding.description, doc.internal.pageSize.width - 50);
        doc.text(descLines, 30, yPosition);
        yPosition += descLines.length * 4 + 3;

        // Status
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor);
        doc.text(`Status: ${finding.status}`, 30, yPosition);
        yPosition += 5;

        // Remediation (brief)
        if (finding.remediation) {
          doc.setFontSize(9);
          doc.setTextColor(primaryColor);
          doc.text('Remediation:', 30, yPosition);
          yPosition += 4;
          
          doc.setTextColor(0);
          const remLines = doc.splitTextToSize(finding.remediation.substring(0, 200) + '...', doc.internal.pageSize.width - 55);
          doc.text(remLines, 35, yPosition);
          yPosition += remLines.length * 4 + 8;
        }
      });
    });

    addPageFooter();
  }

  // Remediation Timeline
  if (data.sections.remediation) {
    doc.addPage();
    currentPage++;
    addPageHeader();
    addWatermark();

    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text('Remediation Recommendations', 20, yPosition);
    yPosition += 15;

    // Timeline
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('Remediation Timeline', 20, yPosition);
    yPosition += 10;

    const timelineData = data.sections.remediation.timeline.map((item: any) => [
      item.priority,
      item.findings.length.toString(),
      item.description,
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Priority', 'Count', 'Description']],
      body: timelineData,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 100 },
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Best Practices
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('Security Best Practices', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0);
    data.sections.remediation.bestPractices.forEach((practice: string, index: number) => {
      doc.text(`• ${practice}`, 25, yPosition);
      yPosition += 6;
    });

    addPageFooter();
  }

  // Appendices
  if (data.sections.appendices) {
    doc.addPage();
    currentPage++;
    addPageHeader();
    addWatermark();

    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text('Appendices', 20, yPosition);
    yPosition += 15;

    // Glossary
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('Glossary', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    Object.entries(data.sections.appendices.glossary).forEach(([term, definition]) => {
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(`${term}:`, 25, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(definition as string, 45, yPosition);
      yPosition += 5;
    });

    yPosition += 10;

    // References
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('References', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setTextColor(0);
    data.sections.appendices.references.forEach((ref: string, index: number) => {
      const refLines = doc.splitTextToSize(`${index + 1}. ${ref}`, doc.internal.pageSize.width - 45);
      doc.text(refLines, 25, yPosition);
      yPosition += refLines.length * 4 + 2;
    });

    // Disclaimer
    if (data.sections.appendices.disclaimer) {
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.setFont('helvetica', 'italic');
      const disclaimerLines = doc.splitTextToSize(data.sections.appendices.disclaimer, doc.internal.pageSize.width - 40);
      doc.text(disclaimerLines, 20, yPosition);
    }

    addPageFooter();
  }

  // Generate PDF blob
  const pdfBlob = doc.output('blob');
  const pdfSize = pdfBlob.size;
  const filename = `report-${data.pentest.id}-${Date.now()}.pdf`;
  
  // In production, upload to storage service and return URL
  // For now, create a data URL
  const reader = new FileReader();
  const dataUrl = await new Promise<string>((resolve) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(pdfBlob);
  });

  return {
    url: dataUrl,
    size: pdfSize,
    filename,
    blob: pdfBlob,
  };
}
