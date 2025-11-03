'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Target,
  Shield,
  Bug,
  Globe,
  Server,
  Smartphone,
  Cloud,
  Database,
  Activity,
  AlertCircle,
  AlertTriangle,
  Info,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  User,
  Lock,
  Unlock,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const TYPE_CONFIG = {
  WEB_APP: { icon: Globe, color: 'text-blue-600 bg-blue-100' },
  API: { icon: Server, color: 'text-purple-600 bg-purple-100' },
  MOBILE_APP: { icon: Smartphone, color: 'text-green-600 bg-green-100' },
  NETWORK: { icon: Activity, color: 'text-orange-600 bg-orange-100' },
  CLOUD: { icon: Cloud, color: 'text-cyan-600 bg-cyan-100' },
  DATABASE: { icon: Database, color: 'text-yellow-600 bg-yellow-100' },
  HOST: { icon: Server, color: 'text-red-600 bg-red-100' },
  OTHER: { icon: Shield, color: 'text-gray-600 bg-gray-100' },
};

const SEVERITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#3b82f6',
  INFO: '#6b7280',
};

export default function TargetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [target, setTarget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTarget();
    }
  }, [id]);

  const fetchTarget = async () => {
    try {
      const response = await fetch(`/api/targets/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setTarget(data.data);
      }
    } catch (error) {
      console.error('Error fetching target:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/targets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/targets');
      } else {
        alert('Cannot delete target with existing pentests or findings');
      }
    } catch (error) {
      console.error('Error deleting target:', error);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const response = await fetch(`/api/targets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTarget();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!target) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Target not found</h3>
          <div className="mt-6">
            <Link
              href="/dashboard/targets"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Back to Targets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const TypeIcon = TYPE_CONFIG[target.type as keyof typeof TYPE_CONFIG]?.icon || Shield;
  const typeConfig = TYPE_CONFIG[target.type as keyof typeof TYPE_CONFIG];

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

  const getRiskTrend = () => {
    if (!target.riskTrend || target.riskTrend.length < 2) return 'stable';
    const lastTwo = target.riskTrend.slice(-2);
    const diff = lastTwo[1].riskScore - lastTwo[0].riskScore;
    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  };

  const riskTrend = getRiskTrend();

  // Prepare chart data
  const vulnerabilityData = Object.entries(target.vulnerabilityStats?.bySeverity || {}).map(([key, value]) => ({
    name: key,
    value,
    fill: SEVERITY_COLORS[key as keyof typeof SEVERITY_COLORS],
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/targets"
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className={cn("p-3 rounded-lg", typeConfig?.color)}>
                <TypeIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{target.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {target.type.replace('_', ' ')} • Added {new Date(target.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleStatusToggle}
              className={cn(
                "inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium",
                target.status === 'ACTIVE'
                  ? "border-green-300 text-green-700 bg-white hover:bg-green-50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              )}
            >
              {target.status === 'ACTIVE' ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Active
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Inactive
                </>
              )}
            </button>
            <Link
              href={`/dashboard/targets/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Risk Score Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Risk Assessment</h2>
            <p className="text-sm text-gray-500">Current security posture</p>
          </div>
          <div className="flex items-center space-x-2">
            {riskTrend === 'increasing' ? (
              <TrendingUp className="h-5 w-5 text-red-600" />
            ) : riskTrend === 'decreasing' ? (
              <TrendingDown className="h-5 w-5 text-green-600" />
            ) : (
              <Minus className="h-5 w-5 text-gray-600" />
            )}
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              getRiskColor(target.riskScore)
            )}>
              {getRiskLabel(target.riskScore)} Risk
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Risk Score</span>
            <span className="text-2xl font-bold text-gray-900">{target.riskScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={cn(
                "h-4 rounded-full transition-all",
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Pentests</p>
              <p className="text-2xl font-bold text-gray-900">{target._count?.pentests || 0}</p>
            </div>
            <Shield className="h-8 w-8 text-indigo-100" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Findings</p>
              <p className="text-2xl font-bold text-gray-900">{target._count?.findings || 0}</p>
            </div>
            <Bug className="h-8 w-8 text-red-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Open Issues</p>
              <p className="text-2xl font-bold text-gray-900">
                {target.vulnerabilityStats?.byStatus?.OPEN || 0}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {target.vulnerabilityStats?.bySeverity?.CRITICAL || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-100" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'pentests', 'findings', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-2 px-6 border-b-2 font-medium text-sm capitalize",
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab}
                {tab === 'pentests' && target.recentPentests?.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {target.recentPentests.length}
                  </span>
                )}
                {tab === 'findings' && target.activeFindings?.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                    {target.activeFindings.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Target Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {target.url && (
                    <div>
                      <dt className="text-sm text-gray-500">URL</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a
                          href={target.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500 inline-flex items-center"
                        >
                          {target.url}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </dd>
                    </div>
                  )}
                  {target.ipAddress && (
                    <div>
                      <dt className="text-sm text-gray-500">IP Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">{target.ipAddress}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        target.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        target.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      )}>
                        {target.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(target.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {target.description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{target.description}</p>
                </div>
              )}

              {target.scope && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Scope</h3>
                  <div className="space-y-2">
                    {target.scope.included?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">In Scope:</p>
                        <div className="flex flex-wrap gap-2">
                          {target.scope.included.map((item: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {target.scope.excluded?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Out of Scope:</p>
                        <div className="flex flex-wrap gap-2">
                          {target.scope.excluded.map((item: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pentests Tab */}
          {activeTab === 'pentests' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Pentests ({target.recentPentests?.length || 0})
                </h3>
                <Link
                  href={`/dashboard/pentests/new?targetId=${id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Pentest
                </Link>
              </div>

              {target.recentPentests?.length > 0 ? (
                <div className="space-y-4">
                  {target.recentPentests.map((pentest: any) => (
                    <div key={pentest.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/dashboard/pentests/${pentest.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {pentest.title}
                          </Link>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500">
                              Created by {pentest.createdBy?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pentest.findingsCount} findings
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            pentest.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            pentest.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                            pentest.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          )}>
                            {pentest.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(pentest.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No pentests conducted yet</p>
                </div>
              )}
            </div>
          )}

          {/* Findings Tab */}
          {activeTab === 'findings' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Active Findings ({target.activeFindings?.length || 0})
              </h3>

              {target.activeFindings?.length > 0 ? (
                <div className="space-y-4">
                  {target.activeFindings.map((finding: any) => {
                    const severityColor = SEVERITY_COLORS[finding.severity as keyof typeof SEVERITY_COLORS];
                    
                    return (
                      <div key={finding.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div 
                              className="w-2 h-full rounded"
                              style={{ backgroundColor: severityColor }}
                            />
                            <div>
                              <Link
                                href={`/dashboard/findings/${finding.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                              >
                                {finding.title}
                              </Link>
                              <p className="text-xs text-gray-500 mt-1">
                                From: {finding.pentest?.title} • 
                                Reported by {finding.reporter?.fullName}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full",
                              finding.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                              finding.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            )}>
                              {finding.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {finding.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bug className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No active findings</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Vulnerability Distribution */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vulnerability Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">By Severity</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={vulnerabilityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {vulnerabilityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">By Status</h4>
                    <div className="space-y-3">
                      {Object.entries(target.vulnerabilityStats?.byStatus || {}).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {status.toLowerCase()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full",
                                  status === 'OPEN' ? 'bg-red-500' :
                                  status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                                  status === 'RESOLVED' ? 'bg-green-500' :
                                  'bg-gray-500'
                                )}
                                style={{ 
                                  width: `${((count as number) / target._count?.findings) * 100 || 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">
                              {count as number}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Trend */}
              {target.riskTrend && target.riskTrend.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Score Trend</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={target.riskTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="riskScore" 
                          stroke="#6366f1" 
                          strokeWidth={2}
                          dot={{ fill: '#6366f1' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Target</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this target? This action cannot be undone.
              {(target._count?.pentests > 0 || target._count?.findings > 0) && (
                <span className="block mt-2 text-red-600">
                  Warning: This target has associated pentests or findings.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
