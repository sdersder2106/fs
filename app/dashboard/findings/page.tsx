'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui';
import Badge from '@/components/ui/Badge';

interface Finding {
  id: string;
  title: string;
  severity: string;
  status: string;
  cvssScore: number;
  category: string | null;
  createdAt: string;
  pentest: {
    id: string;
    title: string;
  };
  target: {
    id: string;
    name: string;
  };
  reporter: {
    id: string;
    fullName: string;
  };
}

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchFindings();
  }, []);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (severityFilter) params.append('severity', severityFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/findings?${params}`);
      const data = await res.json();
      if (data.success) {
        setFindings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch findings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'red',
      HIGH: 'orange',
      MEDIUM: 'yellow',
      LOW: 'blue',
      INFO: 'gray',
    };
    return colors[severity] || 'gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Findings</h1>
          <p className="text-gray-600 mt-1">Manage vulnerabilities</p>
        </div>
        <Link href="/dashboard/findings/new">
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            New Finding
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search findings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchFindings()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <Button variant="primary" onClick={fetchFindings}>
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Findings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : findings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-600 mb-4">No findings found</p>
          <Link href="/dashboard/findings/new">
            <Button variant="primary">Create Your First Finding</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y">
          {findings.map((finding) => (
            <Link key={finding.id} href={`/dashboard/findings/${finding.id}`}>
              <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getSeverityColor(finding.severity)}>
                        {finding.severity}
                      </Badge>
                      <span className="text-sm text-gray-600">CVSS {finding.cvssScore}</span>
                      {finding.category && (
                        <Badge variant="gray">{finding.category}</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {finding.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{finding.pentest.title}</span>
                      <span>•</span>
                      <span>{finding.target.name}</span>
                      <span>•</span>
                      <span>{new Date(finding.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant="blue">{finding.status.replace('_', ' ')}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
