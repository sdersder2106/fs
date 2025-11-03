'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target,
  Plus,
  Search,
  Filter,
  Globe,
  Server,
  Smartphone,
  Cloud,
  Database,
  Activity,
  AlertTriangle,
  Shield,
  MoreVertical,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const TYPE_ICONS = {
  WEB_APP: Globe,
  API: Server,
  MOBILE_APP: Smartphone,
  NETWORK: Activity,
  CLOUD: Cloud,
  DATABASE: Database,
  HOST: Server,
  OTHER: Shield,
};

const TYPE_COLORS = {
  WEB_APP: 'text-blue-600 bg-blue-100',
  API: 'text-purple-600 bg-purple-100',
  MOBILE_APP: 'text-green-600 bg-green-100',
  NETWORK: 'text-orange-600 bg-orange-100',
  CLOUD: 'text-cyan-600 bg-cyan-100',
  DATABASE: 'text-yellow-600 bg-yellow-100',
  HOST: 'text-red-600 bg-red-100',
  OTHER: 'text-gray-600 bg-gray-100',
};

export default function TargetsPage() {
  const router = useRouter();
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchTargets();
  }, [searchQuery, typeFilter, statusFilter, pagination.page]);

  const fetchTargets = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { query: searchQuery }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/targets?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTargets(data.data.items);
        setPagination({
          ...pagination,
          total: data.data.total,
          totalPages: data.data.totalPages,
        });
      }
    } catch (error) {
      console.error('Error fetching targets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this target? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/targets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTargets();
      } else {
        alert('Cannot delete target with existing pentests or findings');
      }
    } catch (error) {
      console.error('Error deleting target:', error);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    if (score >= 20) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Minimal';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Targets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your assessment targets and assets
          </p>
        </div>
        <Link
          href="/dashboard/targets/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Target
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search targets..."
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                {Object.keys(TYPE_ICONS).map((type) => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targets.map((target) => {
          const TypeIcon = TYPE_ICONS[target.type as keyof typeof TYPE_ICONS] || Shield;
          const typeColor = TYPE_COLORS[target.type as keyof typeof TYPE_COLORS] || TYPE_COLORS.OTHER;
          
          return (
            <div key={target.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-3 rounded-lg", typeColor)}>
                    <TypeIcon className="h-6 w-6" />
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/targets/${target.id}`}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/dashboard/targets/${target.id}/edit`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(target.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {target.name}
                </h3>
                
                {target.url && (
                  <p className="text-sm text-gray-500 mb-2 truncate">
                    {target.url}
                  </p>
                )}

                {target.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {target.description}
                  </p>
                )}

                {/* Risk Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Risk Score</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      getRiskColor(target.riskScore)
                    )}>
                      {getRiskLabel(target.riskScore)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        target.riskScore >= 80 ? 'bg-red-500' :
                        target.riskScore >= 60 ? 'bg-orange-500' :
                        target.riskScore >= 40 ? 'bg-yellow-500' :
                        target.riskScore >= 20 ? 'bg-blue-500' :
                        'bg-green-500'
                      )}
                      style={{ width: `${target.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Pentests</span>
                    <p className="font-semibold text-gray-900">{target.stats?.totalPentests || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Open Findings</span>
                    <p className="font-semibold text-gray-900">
                      {Object.values(target.stats?.openFindings || {}).reduce((a: any, b: any) => a + b, 0)}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    target.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    target.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  )}>
                    {target.status}
                  </span>
                  
                  {target.stats?.latestPentest && (
                    <Link
                      href={`/dashboard/pentests/${target.stats.latestPentest.id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-500"
                    >
                      Latest: {target.stats.latestPentest.title}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {targets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No targets found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first target.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/targets/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Target
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
            
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPagination({ ...pagination, page: pageNumber })}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md",
                    pagination.page === pageNumber
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border"
                  )}
                >
                  {pageNumber}
                </button>
              );
            })}
            
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
