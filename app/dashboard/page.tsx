'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Shield, 
  Target, 
  Bug, 
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui';
import { StatCard } from '@/components/cards/StatCard';
import { ComplianceCard } from '@/components/cards/ComplianceCard';
import { VulnerabilitySeverityChart } from '@/components/charts/VulnerabilitySeverityChart';
import { VulnerabilityBreakdownChart } from '@/components/charts/VulnerabilityBreakdownChart';
import { RecentActivity } from '@/components/lists/RecentActivity';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useDashboard, usePrefetch } from '@/hooks/useSimpleCache';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const { data: dashboardData, isLoading, error } = useDashboard(selectedPeriod);
  const { prefetchPentests, prefetchFindings } = usePrefetch();
  
  // Prefetch data for navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      prefetchPentests();
      prefetchFindings();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!session) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">Please log in to view the dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    activePentests: 0,
    criticalFindings: 0,
    highRiskTargets: 0,
    totalFindings: 0,
    completedPentests: 0
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {session?.user?.name || 'User'}! Here's your security overview.
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Critical Findings"
          value={stats.criticalFindings}
          subtitle={`${stats.totalFindings} total`}
          icon={AlertTriangle}
          trend={stats.criticalFindings > 0 ? "up" : "neutral"}
          trendValue={0}
          color="red"
        />
        
        <StatCard
          title="Active Pentests"
          value={stats.activePentests}
          subtitle={`${stats.completedPentests} completed`}
          icon={Shield}
          trend="neutral"
          trendValue={0}
          color="blue"
        />
        
        <StatCard
          title="High Risk Targets"
          value={stats.highRiskTargets}
          subtitle="3 total targets"
          icon={Target}
          trend="down"
          trendValue={0}
          color="orange"
        />
        
        <StatCard
          title="Total Findings"
          value={stats.totalFindings}
          subtitle="3 open"
          icon={Bug}
          trend="neutral"
          trendValue={0}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Findings by Severity
          </h2>
          <div className="h-64">
            <VulnerabilitySeverityChart data={dashboardData?.severityBreakdown} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Findings Trend
          </h2>
          <div className="h-64">
            <VulnerabilityBreakdownChart data={dashboardData?.activityTrend} />
          </div>
        </Card>
      </div>

      {/* Recent Activity and Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={dashboardData?.recentFindings || []} />
        </div>
        
        <div>
          <ComplianceCard 
            percentage={dashboardData?.complianceStatus?.percentage || 0}
            compliant={dashboardData?.complianceStatus?.compliant || 0}
            total={dashboardData?.complianceStatus?.total || 0}
          />
        </div>
      </div>
    </div>
  );
}

// Skeleton loader component
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded-lg"></div>
        <div className="h-80 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Failed to load dashboard data. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {
    activePentests: 0,
    criticalFindings: 0,
    highRiskTargets: 0,
    totalFindings: 0,
    completedPentests: 0
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session?.user?.name || 'User'}! Here's your security overview.
        </p>
      </div>

      {/* Quick Stats with optimized rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <StatCard
            title="Critical Findings"
            value={stats.criticalFindings}
            subtitle={`${stats.totalFindings} total`}
            icon={AlertTriangle}
            trend="up"
            trendValue={12}
            color="red"
          />
        </Suspense>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <StatCard
            title="Active Pentests"
            value={stats.activePentests}
            subtitle={`${stats.completedPentests} completed`}
            icon={Shield}
            trend="up"
            trendValue={8}
            color="blue"
          />
        </Suspense>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <StatCard
            title="High Risk Targets"
            value={stats.highRiskTargets}
            subtitle="3 total targets"
            icon={Target}
            trend="down"
            trendValue={5}
            color="orange"
          />
        </Suspense>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <StatCard
            title="Total Findings"
            value={stats.totalFindings}
            subtitle="3 open"
            icon={Bug}
            trend="up"
            trendValue={15}
            color="green"
          />
        </Suspense>
      </div>

      {/* Charts Section with lazy loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Findings by Severity
            </h2>
            <div className="h-64">
              <VulnerabilitySeverityChart data={dashboard?.severityBreakdown} />
            </div>
          </Card>
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Findings Trend
            </h2>
            <div className="h-64">
              <HeavyChart data={dashboard?.activityTrend} />
            </div>
          </Card>
        </Suspense>
      </div>

      {/* Recent Activity and Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSkeleton />}>
            <RecentActivity activities={dashboard?.recentFindings || []} />
          </Suspense>
        </div>
        
        <div>
          <Suspense fallback={<LoadingSkeleton />}>
            <ComplianceCard 
              percentage={dashboard?.complianceStatus?.percentage || 0}
              compliant={dashboard?.complianceStatus?.compliant || 0}
              total={dashboard?.complianceStatus?.total || 0}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader component
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded-lg"></div>
        <div className="h-80 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}
import { 
  Shield, 
  Target, 
  Bug, 
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SEVERITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#3b82f6',
  INFO: '#6b7280',
};

const STATUS_COLORS = {
  OPEN: '#dc2626',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#10b981',
  CLOSED: '#6b7280',
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    fetchDashboardStats();
  }, [dateRange]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/dashboard?days=${dateRange}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const severityData = stats ? Object.entries(stats.findings.bySeverity).map(([key, value]) => ({
    name: key,
    value,
    color: SEVERITY_COLORS[key as keyof typeof SEVERITY_COLORS],
  })) : [];

  const statusData = stats ? Object.entries(stats.findings.byStatus).map(([key, value]) => ({
    name: key,
    value,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS],
  })) : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {session?.user?.name}! Here's your security overview.
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex justify-end">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Critical Findings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Findings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.findings.openCritical || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.findings.bySeverity.CRITICAL || 0} total
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Active Pentests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Pentests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.pentests.active || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.pentests.completed || 0} completed
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Targets at Risk */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Targets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.targets.highRisk || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.targets.total || 0} total targets
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Total Findings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Findings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.findings.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.findings.byStatus.OPEN || 0} open
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Bug className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Findings by Severity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Findings by Severity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Findings Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Findings Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.findingsTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="critical" stroke={SEVERITY_COLORS.CRITICAL} />
              <Line type="monotone" dataKey="high" stroke={SEVERITY_COLORS.HIGH} />
              <Line type="monotone" dataKey="medium" stroke={SEVERITY_COLORS.MEDIUM} />
              <Line type="monotone" dataKey="low" stroke={SEVERITY_COLORS.LOW} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {stats?.activity?.map((item: any, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={cn(
                  "p-2 rounded-full",
                  item.type === 'finding' ? 'bg-red-100' : 'bg-indigo-100'
                )}>
                  {item.type === 'finding' ? (
                    <Bug className="h-4 w-4 text-red-600" />
                  ) : (
                    <Shield className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.user?.name} • {new Date(item.timestamp).toRelativeTimeString()}
                  </p>
                </div>
                {item.link && (
                  <Link
                    href={item.link}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h2>
          <div className="space-y-4">
            {stats?.compliance?.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    item.status === 'compliant' ? 'bg-green-100' :
                    item.status === 'partial' ? 'bg-yellow-100' : 'bg-red-100'
                  )}>
                    {item.status === 'compliant' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : item.status === 'partial' ? (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.standard}</p>
                    <p className="text-xs text-gray-500">{item.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{item.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this extension to the Date prototype
declare global {
  interface Date {
    toRelativeTimeString(): string;
  }
}

Date.prototype.toRelativeTimeString = function() {
  const seconds = Math.floor((new Date().getTime() - this.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return Math.floor(seconds) + " seconds ago";
};
