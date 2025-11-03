'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bug,
  Plus,
  Search,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  User,
  Target,
  Shield,
  Eye,
  Edit,
  Trash2,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG = {
  CRITICAL: { 
    color: 'text-red-700 bg-red-100 border-red-200',
    icon: AlertCircle,
    label: 'Critical'
  },
  HIGH: { 
    color: 'text-orange-700 bg-orange-100 border-orange-200',
    icon: AlertTriangle,
    label: 'High'
  },
  MEDIUM: { 
    color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
    icon: AlertTriangle,
    label: 'Medium'
  },
  LOW: { 
    color: 'text-blue-700 bg-blue-100 border-blue-200',
    icon: Info,
    label: 'Low'
  },
  INFO: { 
    color: 'text-gray-700 bg-gray-100 border-gray-200',
    icon: Info,
    label: 'Info'
  },
};

const STATUS_CONFIG = {
  OPEN: { 
    color: 'text-red-700 bg-red-50',
    icon: AlertCircle,
    label: 'Open'
  },
  IN_PROGRESS: { 
    color: 'text-yellow-700 bg-yellow-50',
    icon: Clock,
    label: 'In Progress'
  },
  RESOLVED: { 
    color: 'text-green-700 bg-green-50',
    icon: CheckCircle,
    label: 'Resolved'
  },
  CLOSED: { 
    color: 'text-gray-700 bg-gray-50',
    icon: CheckCircle,
    label: 'Closed'
  },
};

export default function FindingsPage() {
  const router = useRouter();
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchFindings();
  }, [searchQuery, severityFilter, statusFilter, categoryFilter, pagination.page]);

  const fetchFindings = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { query: searchQuery }),
        ...(severityFilter && { severity: severityFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });

      const response = await fetch(`/api/findings?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFindings(data.data.items);
        setPagination({
          ...pagination,
          total: data.data.total,
          totalPages: data.data.totalPages,
        });
      }
    } catch (error) {
      console.error('Error fetching findings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this finding?')) {
      return;
    }

    try {
      const response = await fetch(`/api/findings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFindings();
      } else {
        alert('Cannot delete resolved or closed findings');
      }
    } catch (error) {
      console.error('Error deleting finding:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/findings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchFindings();
      }
    } catch (error) {
      console.error('Error updating finding status:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Findings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Security vulnerabilities and issues discovered
          </p>
        </div>
        <Link
          href="/dashboard/findings/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Report Finding
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(SEVERITY_CONFIG).map(([key, config]) => {
          const count = findings.filter(f => f.severity === key).length;
          return (
            <div key={key} className={cn("rounded-lg border p-3", config.color)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{config.label}</span>
                <config.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Severities</option>
                {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g., SQL Injection"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {findings.map((finding) => {
          const severityConfig = SEVERITY_CONFIG[finding.severity as keyof typeof SEVERITY_CONFIG];
          const statusConfig = STATUS_CONFIG[finding.status as keyof typeof STATUS_CONFIG];
          const SeverityIcon = severityConfig.icon;
          const isExpanded = expandedFinding === finding.id;
          
          return (
            <div
              key={finding.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        severityConfig.color
                      )}>
                        <SeverityIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {finding.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Target className="h-3 w-3 mr-1" />
                            {finding.target?.name}
                          </span>
                          <span className="flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            {finding.pentest?.title}
                          </span>
                          {finding.cvssScore > 0 && (
                            <span className="font-medium">
                              CVSS: {finding.cvssScore}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-2 line-clamp-2">
                          {finding.description}
                        </p>
                        {finding.category && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {finding.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 ml-4">
                    <select
                      value={finding.status}
                      onChange={(e) => handleStatusChange(finding.id, e.target.value)}
                      className={cn(
                        "text-sm rounded-md px-2 py-1 border-0",
                        statusConfig.color
                      )}
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                    <div className="flex space-x-1">
                      <Link
                        href={`/dashboard/findings/${finding.id}`}
                        className="p-1 text-gray-400 hover:text-indigo-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/findings/${finding.id}/edit`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(finding.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <button
                  onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                  className="mt-3 flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 mr-1 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                  {isExpanded ? 'Hide' : 'Show'} Details
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {finding.evidence.hasProofOfConcept && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Proof of Concept</h4>
                        <p className="text-sm text-gray-600">Available</p>
                      </div>
                    )}
                    {finding.remediation.hasRemediation && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Remediation</h4>
                        <p className="text-sm text-gray-600">Provided</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          Reported by {finding.reporter?.fullName}
                        </span>
                        {finding.assignedTo && (
                          <span className="flex items-center text-gray-500">
                            <User className="h-3 w-3 mr-1" />
                            Assigned to {finding.assignedTo.fullName}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500">
                        {new Date(finding.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {findings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <Bug className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No findings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by reporting your first security finding.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/findings/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Finding
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page === 1}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md",
                pagination.page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              )}
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })}
              disabled={pagination.page === pagination.totalPages}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md",
                pagination.page === pagination.totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              )}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
