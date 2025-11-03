'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Shield, 
  Target, 
  Bug, 
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui';
import StatCard from '@/components/cards/StatCard'; // Default import
import ComplianceCard from '@/components/cards/ComplianceCard'; // Default import
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
          <p className="text-red-700">Failed to load dashboard data. Please refresh the page.</p>
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
            Welcome back, {session?.user?.name || 'User'}! Here&apos;s your security overview.
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