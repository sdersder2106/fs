'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bug,
  Plus,
  Search,
  Shield,
  AlertTriangle,
  Info,
  Eye,
  Edit,
  MessageSquare,
} from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/ui/loading';
import { toast } from 'sonner';
import { formatDate, getSeverityColor, getStatusColor } from '@/lib/utils';
import { AuditorOnly } from '@/components/auth/role-guard';

const SEVERITY_ICONS = {
  CRITICAL: Shield,
  HIGH: AlertTriangle,
  MEDIUM: AlertTriangle,
  LOW: Info,
  INFORMATIONAL: Info,
};

export default function FindingsPage() {
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFindings();
  }, [search, severity, status, page]);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '12',
      });

      if (search) params.append('search', search);
      if (severity !== 'ALL') params.append('severity', severity);
      if (status !== 'ALL') params.append('status', status);

      const response = await fetch(`/api/findings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFindings(data.data);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Failed to fetch findings');
      }
    } catch (error) {
      console.error('Fetch findings error:', error);
      toast.error('Failed to fetch findings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && findings.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Findings</h1>
          <p className="text-muted-foreground">
            Track and manage security vulnerabilities
          </p>
        </div>
        <AuditorOnly>
          <Link href="/findings/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Finding
            </Button>
          </Link>
        </AuditorOnly>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search findings..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={severity}
              onValueChange={(value) => {
                setSeverity(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Severities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="INFORMATIONAL">Informational</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Findings List */}
      {findings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bug className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No findings found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Findings will appear here as they are discovered
            </p>
            <AuditorOnly>
              <Link href="/findings/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Add Finding
                </Button>
              </Link>
            </AuditorOnly>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {findings.map((finding) => {
              const SeverityIcon = SEVERITY_ICONS[finding.severity as keyof typeof SEVERITY_ICONS];

              return (
                <Card key={finding.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          <SeverityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(finding.severity)}>
                              {finding.severity}
                            </Badge>
                            <Badge className={getStatusColor(finding.status)}>
                              {finding.status.replace('_', ' ')}
                            </Badge>
                            {finding.cvssScore && (
                              <Badge variant="outline">
                                CVSS {finding.cvssScore.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg mb-1">
                            {finding.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {finding.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Link href={`/findings/${finding.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AuditorOnly>
                          <Link href={`/findings/${finding.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </AuditorOnly>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>
                          Pentest: {finding.pentest.title}
                        </span>
                        <span>
                          Target: {finding.target.name}
                        </span>
                        {finding._count.comments > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {finding._count.comments}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {finding.assignee && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={finding.assignee.avatar} />
                              <AvatarFallback className="text-xs">
                                {finding.assignee.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {finding.assignee.name}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(finding.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
