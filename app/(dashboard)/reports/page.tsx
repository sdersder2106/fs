'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Plus, Calendar, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LoadingPage } from '@/components/ui/loading';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { AuditorOnly } from '@/components/auth/role-guard';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [pentests, setPentests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedPentest, setSelectedPentest] = useState('');
  const [reportFormat, setReportFormat] = useState('PDF');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReports();
    fetchPentests();
  }, []);

  const fetchReports = async () => {
    try {
      // Simulated - would be real API call
      setReports([
        {
          id: '1',
          title: 'Q4 2024 Security Assessment Report',
          format: 'PDF',
          status: 'COMPLETED',
          createdAt: new Date('2024-11-01'),
          createdBy: { name: 'John Doe' },
          pentest: { title: 'Q4 2024 Security Assessment' },
        },
        {
          id: '2',
          title: 'Production API Pentest Report',
          format: 'DOCX',
          status: 'COMPLETED',
          createdAt: new Date('2024-10-15'),
          createdBy: { name: 'Jane Smith' },
          pentest: { title: 'Production API Pentest' },
        },
      ]);
    } catch (error) {
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPentests = async () => {
    try {
      const response = await fetch('/api/pentests?pageSize=100');
      if (response.ok) {
        const data = await response.json();
        setPentests(data.data);
      }
    } catch (error) {
      console.error('Fetch pentests error:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedPentest) {
      toast.error('Please select a pentest');
      return;
    }

    setGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      toast.success('Report generated successfully');
      setOpen(false);
      setSelectedPentest('');
      setGenerating(false);
      fetchReports();
    }, 2000);
  };

  const handleDownloadReport = (reportId: string) => {
    toast.success('Downloading report...');
    // Would trigger actual download
  };

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(search.toLowerCase()) ||
    report.pentest.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage security assessment reports
          </p>
        </div>
        <AuditorOnly>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive security assessment report
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="pentest">Select Pentest</Label>
                  <Select value={selectedPentest} onValueChange={setSelectedPentest}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a pentest" />
                    </SelectTrigger>
                    <SelectContent>
                      {pentests.map((pentest) => (
                        <SelectItem key={pentest.id} value={pentest.id}>
                          {pentest.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Report Format</Label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF Document</SelectItem>
                      <SelectItem value="DOCX">Word Document (DOCX)</SelectItem>
                      <SelectItem value="HTML">HTML Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={generating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateReport} disabled={generating}>
                    {generating ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </AuditorOnly>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or pentest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No reports found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your first security assessment report
            </p>
            <AuditorOnly>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                Generate Report
              </Button>
            </AuditorOnly>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{report.format}</Badge>
                  <Badge className="bg-green-500/10 text-green-500">
                    {report.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {report.title}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                  {report.pentest.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{report.createdBy.name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(report.createdAt)}</span>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleDownloadReport(report.id)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>PDF Reports</strong> include executive summary, detailed findings,
            risk assessment, and remediation recommendations.
          </p>
          <p>
            <strong>Word Documents</strong> are editable and can be customized before
            sharing with stakeholders.
          </p>
          <p>
            <strong>HTML Reports</strong> are interactive and can be hosted on internal
            portals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
