'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, Eye } from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { PageHeader, LoadingSkeleton } from '@/components';
import Badge from '@/components/ui/Badge';

interface Report {
  id: string;
  title: string;
  type: string;
  status: string;
  format: string;
  fileUrl: string | null;
  generatedAt: string | null;
  pentest: {
    id: string;
    title: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pentests, setPentests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    pentestId: '',
    type: 'EXECUTIVE',
    format: 'PDF',
  });

  useEffect(() => {
    fetchReports();
    fetchPentests();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPentests = async () => {
    try {
      const res = await fetch('/api/pentests?limit=100');
      const data = await res.json();
      if (data.success) {
        setPentests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pentests:', error);
    }
  };

  const handleGenerate = async () => {
    if (!formData.pentestId) {
      alert('Please select a pentest');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Report - ${new Date().toLocaleDateString()}`,
          pentestId: formData.pentestId,
          type: formData.type,
          format: formData.format,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Report generation started!');
        fetchReports();
      } else {
        alert(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'gray',
      GENERATING: 'blue',
      COMPLETED: 'green',
      FAILED: 'red',
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download pentest reports"
      />

      {/* Generation Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Pentest"
            value={formData.pentestId}
            onChange={(e) => setFormData({ ...formData, pentestId: e.target.value })}
            options={[
              { value: '', label: 'Select a pentest' },
              ...pentests.map((p) => ({ value: p.id, label: p.title })),
            ]}
          />

          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'EXECUTIVE', label: 'Executive Summary' },
              { value: 'TECHNICAL', label: 'Technical Report' },
              { value: 'FULL', label: 'Full Report' },
            ]}
          />

          <Select
            label="Format"
            value={formData.format}
            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
            options={[
              { value: 'PDF', label: 'PDF' },
              { value: 'DOCX', label: 'Word (DOCX)' },
              { value: 'HTML', label: 'HTML' },
            ]}
          />
        </div>

        <div className="mt-4">
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={generating || !formData.pentestId}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
        </div>

        {loading ? (
          <div className="p-4">
            <LoadingSkeleton type="list" count={3} />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No reports generated yet
          </div>
        ) : (
          <div className="divide-y">
            {reports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <Badge variant={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {report.pentest.title} • {report.type} • {report.format}
                    </p>
                    {report.generatedAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Generated: {new Date(report.generatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {report.status === 'COMPLETED' && report.fileUrl && (
                    <div className="flex gap-2">
                      <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </a>
                      <a href={report.fileUrl} download>
                        <Button variant="primary" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
