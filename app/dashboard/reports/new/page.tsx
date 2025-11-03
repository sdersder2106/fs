'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText,
  Download,
  Send,
  Eye,
  Settings,
  Plus,
  Check,
  AlertCircle,
  Calendar,
  User,
  Building,
  Shield,
  Bug,
  Target,
  ChevronRight,
  Loader,
  FileDown,
  Mail,
  Globe,
  Lock,
  Unlock,
  Copy,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const REPORT_TYPES = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview for management and stakeholders',
    icon: Building,
    color: 'bg-blue-100 text-blue-700',
    sections: ['Overview', 'Key Findings', 'Risk Assessment', 'Recommendations'],
    audience: 'C-Level, Management',
    pages: '5-10',
  },
  {
    id: 'technical',
    name: 'Technical Report',
    description: 'Detailed technical findings with proof of concepts',
    icon: Bug,
    color: 'bg-purple-100 text-purple-700',
    sections: ['Methodology', 'Detailed Findings', 'Proof of Concepts', 'Remediation Code'],
    audience: 'Security Team, Developers',
    pages: '20-50',
  },
  {
    id: 'compliance',
    name: 'Compliance Report',
    description: 'Regulatory compliance and standards assessment',
    icon: Shield,
    color: 'bg-green-100 text-green-700',
    sections: ['Standards Coverage', 'Compliance Gaps', 'Controls Assessment', 'Action Plan'],
    audience: 'Compliance Officer, Auditors',
    pages: '15-30',
  },
  {
    id: 'full',
    name: 'Full Report',
    description: 'Comprehensive report with all sections included',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-700',
    sections: ['All Sections', 'Appendices', 'Evidence', 'References'],
    audience: 'All Stakeholders',
    pages: '50+',
  },
];

const REPORT_FORMATS = [
  { id: 'pdf', name: 'PDF', icon: FileDown, description: 'Portable Document Format' },
  { id: 'docx', name: 'Word', icon: FileText, description: 'Microsoft Word Document' },
  { id: 'html', name: 'HTML', icon: Globe, description: 'Web-based Report' },
  { id: 'json', name: 'JSON', icon: FileText, description: 'Machine-readable Format' },
];

const DISTRIBUTION_METHODS = [
  { id: 'download', name: 'Direct Download', icon: Download },
  { id: 'email', name: 'Email Delivery', icon: Mail },
  { id: 'portal', name: 'Client Portal', icon: Globe },
];

export default function ReportGeneratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pentestId = searchParams.get('pentestId');

  const [loading, setLoading] = useState(false);
  const [pentests, setPentests] = useState<any[]>([]);
  const [selectedPentest, setSelectedPentest] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [reportConfig, setReportConfig] = useState({
    pentestId: pentestId || '',
    reportType: 'executive',
    format: 'pdf',
    templateId: '',
    title: '',
    includeExecutiveSummary: true,
    includeFindings: true,
    includeMethodology: true,
    includeRemediation: true,
    includeAppendices: false,
    findingSeverityFilter: [] as string[],
    findingStatusFilter: [] as string[],
    customSections: [] as string[],
    watermark: true,
    confidential: true,
    distribution: 'download',
    recipients: [] as string[],
    language: 'en',
  });
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPentests();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (pentestId && pentests.length > 0) {
      const pentest = pentests.find(p => p.id === pentestId);
      if (pentest) {
        setSelectedPentest(pentest);
        setReportConfig(prev => ({
          ...prev,
          pentestId,
          title: `${pentest.title} - Security Assessment Report`,
        }));
      }
    }
  }, [pentestId, pentests]);

  const fetchPentests = async () => {
    try {
      const response = await fetch('/api/pentests?status=COMPLETED,REPORTED');
      const data = await response.json();
      if (data.success) {
        setPentests(data.data.items);
      }
    } catch (error) {
      console.error('Error fetching pentests:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates?type=REPORT');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data.items);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handlePentestChange = (pentestId: string) => {
    const pentest = pentests.find(p => p.id === pentestId);
    setSelectedPentest(pentest);
    setReportConfig(prev => ({
      ...prev,
      pentestId,
      title: pentest ? `${pentest.title} - Security Assessment Report` : '',
    }));
  };

  const handleReportTypeChange = (typeId: string) => {
    setReportConfig(prev => ({
      ...prev,
      reportType: typeId,
      // Adjust included sections based on report type
      includeExecutiveSummary: typeId !== 'technical',
      includeFindings: true,
      includeMethodology: typeId === 'technical' || typeId === 'full',
      includeRemediation: typeId === 'technical' || typeId === 'full',
      includeAppendices: typeId === 'full',
    }));
  };

  const toggleSeverityFilter = (severity: string) => {
    setReportConfig(prev => ({
      ...prev,
      findingSeverityFilter: prev.findingSeverityFilter.includes(severity)
        ? prev.findingSeverityFilter.filter(s => s !== severity)
        : [...prev.findingSeverityFilter, severity],
    }));
  };

  const generateReport = async () => {
    if (!reportConfig.pentestId || !reportConfig.title) {
      alert('Please select a pentest and provide a title');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportConfig),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedReport(data.data);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!generatedReport) return;

    // Simulate download
    const link = document.createElement('a');
    link.href = generatedReport.url;
    link.download = generatedReport.filename;
    link.click();
  };

  const emailReport = async () => {
    if (!generatedReport || reportConfig.recipients.length === 0) {
      alert('Please add recipient email addresses');
      return;
    }

    try {
      const response = await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: generatedReport.id,
          recipients: reportConfig.recipients,
        }),
      });

      if (response.ok) {
        alert('Report sent successfully');
      }
    } catch (error) {
      console.error('Error sending report:', error);
    }
  };

  const selectedReportType = REPORT_TYPES.find(t => t.id === reportConfig.reportType);
  const selectedFormat = REPORT_FORMATS.find(f => f.id === reportConfig.format);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/reports"
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Generate Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create professional security assessment reports
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pentest Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Pentest</h2>
            <div className="space-y-3">
              <select
                value={reportConfig.pentestId}
                onChange={(e) => handlePentestChange(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a pentest...</option>
                {pentests.map((pentest) => (
                  <option key={pentest.id} value={pentest.id}>
                    {pentest.title} - {pentest.target?.name}
                  </option>
                ))}
              </select>

              {selectedPentest && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Target:</span>
                      <p className="font-medium">{selectedPentest.target?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium">{selectedPentest.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Findings:</span>
                      <p className="font-medium">{selectedPentest.stats?.findings || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium">
                        {new Date(selectedPentest.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REPORT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = reportConfig.reportType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => handleReportTypeChange(type.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-colors",
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn("p-2 rounded-lg", type.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{type.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-400">
                            <span className="font-medium">Audience:</span> {type.audience}
                          </p>
                          <p className="text-xs text-gray-400">
                            <span className="font-medium">Length:</span> {type.pages} pages
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-indigo-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h2>
            
            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={reportConfig.title}
                onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter report title..."
              />
            </div>

            {/* Format Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-4 gap-3">
                {REPORT_FORMATS.map((format) => {
                  const Icon = format.icon;
                  const isSelected = reportConfig.format === format.id;
                  
                  return (
                    <button
                      key={format.id}
                      onClick={() => setReportConfig(prev => ({ ...prev, format: format.id }))}
                      className={cn(
                        "p-3 rounded-lg border text-center transition-colors",
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      )}
                    >
                      <Icon className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">{format.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sections to Include */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Sections
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeExecutiveSummary}
                    onChange={(e) => setReportConfig(prev => ({ 
                      ...prev, 
                      includeExecutiveSummary: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Executive Summary</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeFindings}
                    onChange={(e) => setReportConfig(prev => ({ 
                      ...prev, 
                      includeFindings: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Detailed Findings</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeMethodology}
                    onChange={(e) => setReportConfig(prev => ({ 
                      ...prev, 
                      includeMethodology: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Testing Methodology</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeRemediation}
                    onChange={(e) => setReportConfig(prev => ({ 
                      ...prev, 
                      includeRemediation: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remediation Guidance</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeAppendices}
                    onChange={(e) => setReportConfig(prev => ({ 
                      ...prev, 
                      includeAppendices: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Appendices & References</span>
                </label>
              </div>
            </div>

            {/* Finding Filters */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finding Filters
              </label>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Include by Severity:</p>
                  <div className="flex flex-wrap gap-2">
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map((severity) => (
                      <button
                        key={severity}
                        onClick={() => toggleSeverityFilter(severity)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                          reportConfig.findingSeverityFilter.includes(severity)
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {severity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Options */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.watermark}
                    onChange={(e) => setReportConfig(prev => ({ 
                      ...prev, 
                      watermark: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Add watermark</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.confidential}
                    onChange={(e) => setReportConfig(prev => ({ 
                      ...prev, 
                      confidential: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mark as confidential</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Actions Panel */}
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Template</h2>
            <select
              value={reportConfig.templateId}
              onChange={(e) => setReportConfig(prev => ({ ...prev, templateId: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Default Template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <Link
              href="/dashboard/templates"
              className="text-xs text-indigo-600 hover:text-indigo-500 mt-2 inline-block"
            >
              Manage templates →
            </Link>
          </div>

          {/* Distribution Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Distribution</h2>
            <div className="space-y-3">
              {DISTRIBUTION_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = reportConfig.distribution === method.id;
                
                return (
                  <label
                    key={method.id}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="distribution"
                      value={method.id}
                      checked={isSelected}
                      onChange={(e) => setReportConfig(prev => ({ 
                        ...prev, 
                        distribution: e.target.value 
                      }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <Icon className="h-4 w-4 ml-3 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-700">{method.name}</span>
                  </label>
                );
              })}
            </div>

            {reportConfig.distribution === 'email' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients
                </label>
                <textarea
                  placeholder="Enter email addresses (one per line)"
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  onChange={(e) => setReportConfig(prev => ({ 
                    ...prev, 
                    recipients: e.target.value.split('\n').filter(email => email.trim()) 
                  }))}
                />
              </div>
            )}
          </div>

          {/* Report Summary */}
          <div className="bg-indigo-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-indigo-900 mb-3">Report Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-indigo-600">Type:</dt>
                <dd className="font-medium text-indigo-900">
                  {selectedReportType?.name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-indigo-600">Format:</dt>
                <dd className="font-medium text-indigo-900">
                  {selectedFormat?.name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-indigo-600">Sections:</dt>
                <dd className="font-medium text-indigo-900">
                  {[
                    reportConfig.includeExecutiveSummary && 'Summary',
                    reportConfig.includeFindings && 'Findings',
                    reportConfig.includeMethodology && 'Methodology',
                    reportConfig.includeRemediation && 'Remediation',
                    reportConfig.includeAppendices && 'Appendices',
                  ].filter(Boolean).length}
                </dd>
              </div>
              {selectedPentest && (
                <div className="flex justify-between">
                  <dt className="text-indigo-600">Findings:</dt>
                  <dd className="font-medium text-indigo-900">
                    {selectedPentest.stats?.findings || 0}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={generateReport}
              disabled={loading || !reportConfig.pentestId}
              className={cn(
                "w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
                loading || !reportConfig.pentestId
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>

            {generatedReport && (
              <>
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Report
                </button>

                {reportConfig.distribution === 'download' && (
                  <button
                    onClick={downloadReport}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </button>
                )}

                {reportConfig.distribution === 'email' && (
                  <button
                    onClick={emailReport}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Report
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {showPreview && generatedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Report Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Preview content would be rendered here */}
              <div className="prose max-w-none">
                <h1>{reportConfig.title}</h1>
                <p className="text-gray-500">
                  Generated on {new Date().toLocaleDateString()}
                </p>
                <div className="mt-8">
                  {/* Preview sections based on config */}
                  {reportConfig.includeExecutiveSummary && (
                    <section>
                      <h2>Executive Summary</h2>
                      <p>This report presents the findings from the security assessment...</p>
                    </section>
                  )}
                  {/* More preview content... */}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={downloadReport}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
