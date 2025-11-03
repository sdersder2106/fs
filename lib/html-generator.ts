// HTML Report Generator

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

export async function generateHTML(data: ReportData, config: ReportConfig) {
  const html = `
<!DOCTYPE html>
<html lang="${config.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.metadata.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .header {
      text-align: center;
      padding: 60px 0;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 40px;
    }
    
    .logo {
      width: 150px;
      margin-bottom: 20px;
    }
    
    h1 {
      font-size: 2.5em;
      color: #1a202c;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 1.2em;
      color: #718096;
      margin-bottom: 30px;
    }
    
    .metadata {
      display: flex;
      justify-content: center;
      gap: 30px;
      font-size: 0.9em;
      color: #718096;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      margin: 10px 0;
    }
    
    .badge-executive { background: #e0e7ff; color: #3730a3; }
    .badge-technical { background: #ede9fe; color: #6b21a8; }
    .badge-compliance { background: #d1fae5; color: #065f46; }
    .badge-full { background: #e0e7ff; color: #3730a3; }
    
    .section {
      margin: 40px 0;
    }
    
    h2 {
      font-size: 1.8em;
      color: #2d3748;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    h3 {
      font-size: 1.3em;
      color: #4a5568;
      margin: 20px 0 10px 0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    
    .stat-card {
      padding: 20px;
      background: #f7fafc;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #2d3748;
    }
    
    .stat-label {
      font-size: 0.85em;
      color: #718096;
      margin-top: 5px;
    }
    
    .severity-critical { color: #dc2626; }
    .severity-high { color: #f97316; }
    .severity-medium { color: #f59e0b; }
    .severity-low { color: #3b82f6; }
    .severity-info { color: #6b7280; }
    
    .finding {
      margin: 20px 0;
      padding: 20px;
      background: #f9fafb;
      border-left: 4px solid;
      border-radius: 4px;
    }
    
    .finding-critical { border-color: #dc2626; }
    .finding-high { border-color: #f97316; }
    .finding-medium { border-color: #f59e0b; }
    .finding-low { border-color: #3b82f6; }
    .finding-info { border-color: #6b7280; }
    
    .finding-title {
      font-weight: 600;
      margin-bottom: 10px;
      color: #1a202c;
    }
    
    .finding-meta {
      font-size: 0.85em;
      color: #718096;
      margin-bottom: 10px;
    }
    
    .finding-description {
      color: #4a5568;
      line-height: 1.6;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    
    th {
      background: #f7fafc;
      font-weight: 600;
      color: #2d3748;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #718096;
      font-size: 0.9em;
    }
    
    ${config.watermark ? `
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(0, 0, 0, 0.05);
      font-weight: bold;
      pointer-events: none;
      z-index: -1;
    }
    ` : ''}
    
    @media print {
      .container { max-width: 100%; }
      .section { page-break-inside: avoid; }
      .finding { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${config.watermark ? `<div class="watermark">${config.confidential ? 'CONFIDENTIAL' : 'DRAFT'}</div>` : ''}
  
  <div class="container">
    <!-- Header -->
    <div class="header">
      ${data.metadata.company.logo ? `<img src="${data.metadata.company.logo}" alt="${data.metadata.company.name}" class="logo">` : ''}
      <h1>${data.metadata.title}</h1>
      <div class="subtitle">${data.target.name} Security Assessment</div>
      <div class="badge badge-${data.metadata.reportType.toLowerCase()}">${data.metadata.reportType} REPORT</div>
      <div class="metadata">
        <div><strong>Generated:</strong> ${new Date(data.metadata.generatedAt).toLocaleDateString()}</div>
        <div><strong>By:</strong> ${data.metadata.generatedBy}</div>
        <div><strong>Company:</strong> ${data.metadata.company.name}</div>
      </div>
    </div>
    
    <!-- Executive Summary -->
    ${data.sections.executiveSummary ? `
    <div class="section">
      <h2>Executive Summary</h2>
      <p>${data.sections.executiveSummary.overview}</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${data.statistics.totalFindings}</div>
          <div class="stat-label">Total Findings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value severity-critical">${data.statistics.findingsBySeverity.CRITICAL}</div>
          <div class="stat-label">Critical</div>
        </div>
        <div class="stat-card">
          <div class="stat-value severity-high">${data.statistics.findingsBySeverity.HIGH}</div>
          <div class="stat-label">High</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.statistics.overallRiskScore}</div>
          <div class="stat-label">Risk Score</div>
        </div>
      </div>
      
      <h3>Key Recommendations</h3>
      <ul>
        ${data.sections.executiveSummary.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    <!-- Statistics -->
    <div class="section">
      <h2>Assessment Statistics</h2>
      
      <h3>Severity Distribution</h3>
      <table>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(data.statistics.findingsBySeverity).map(([severity, count]) => `
          <tr>
            <td class="severity-${severity.toLowerCase()}">${severity}</td>
            <td>${count}</td>
            <td>${Math.round((count as number / data.statistics.totalFindings) * 100)}%</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      
      <h3>Status Distribution</h3>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(data.statistics.findingsByStatus).map(([status, count]) => `
          <tr>
            <td>${status}</td>
            <td>${count}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Findings -->
    ${data.sections.findings ? `
    <div class="section">
      <h2>Detailed Findings</h2>
      
      ${data.sections.findings.map((group: any) => `
        ${group.findings.length > 0 ? `
        <h3 class="severity-${group.severity.toLowerCase()}">${group.severity} Severity (${group.count})</h3>
        
        ${group.findings.map((finding: any, index: number) => `
        <div class="finding finding-${finding.severity.toLowerCase()}">
          <div class="finding-title">${index + 1}. ${finding.title}</div>
          <div class="finding-meta">
            CVSS: ${finding.cvssScore || 'N/A'} | Category: ${finding.category || 'General'} | Status: ${finding.status}
          </div>
          <div class="finding-description">
            <p>${finding.description}</p>
            ${finding.remediation ? `
            <h4 style="margin-top: 15px;">Remediation:</h4>
            <p>${finding.remediation}</p>
            ` : ''}
          </div>
        </div>
        `).join('')}
        ` : ''}
      `).join('')}
    </div>
    ` : ''}
    
    <!-- Remediation Timeline -->
    ${data.sections.remediation ? `
    <div class="section">
      <h2>Remediation Recommendations</h2>
      
      <h3>Remediation Timeline</h3>
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Count</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${data.sections.remediation.timeline.map((item: any) => `
          <tr>
            <td>${item.priority}</td>
            <td>${item.findings.length}</td>
            <td>${item.description}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      
      <h3>Security Best Practices</h3>
      <ul>
        ${data.sections.remediation.bestPractices.map((practice: string) => `<li>${practice}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    <!-- Footer -->
    <div class="footer">
      <p>${data.sections.appendices?.disclaimer || 'This report contains confidential information.'}</p>
      <p>Generated by Base44 Security Platform on ${new Date(data.metadata.generatedAt).toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;

  // Convert HTML to buffer
  const buffer = Buffer.from(html, 'utf-8');
  const size = buffer.length;
  const filename = `report-${data.pentest.id}-${Date.now()}.html`;
  
  // In production, save to file system or cloud storage
  // For now, return as data URL
  const dataUrl = `data:text/html;base64,${buffer.toString('base64')}`;
  
  return {
    url: dataUrl,
    size,
    filename,
    html,
  };
}
