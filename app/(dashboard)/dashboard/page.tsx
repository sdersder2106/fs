'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertCircle,
  FileText,
  Target,
  TrendingUp,
  Activity,
  Plus,
  Bug,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading';
import { formatRelativeTime, getSeverityColor, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import {
  PieChart,
  Pie,
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
  Cell,
} from 'recharts';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#3b82f6',
  INFORMATIONAL: '#6b7280',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's your security overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pentests/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Pentest
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
            <AlertCircle className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.criticalFindings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pentests</CardTitle>
            <FileText className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePentests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Targets</CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.highRiskTargets || 0}</div>
            <p className="text-xs text-muted-foreground">
              Critical & high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Findings</CardTitle>
            <Bug className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFindings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.openFindings || 0} open, {stats?.resolvedFindings || 0} resolved
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Severity Distribution */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Findings by Severity</CardTitle>
            <CardDescription>Distribution of vulnerabilities</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.severityDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(stats?.severityDistribution || []).map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Activity className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user.name}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Pentests */}
      <Card>
        <CardHeader>
          <CardTitle>Active Pentests</CardTitle>
          <CardDescription>Current security assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.pentests && stats.pentests.length > 0 ? (
            <div className="space-y-4">
              {stats.pentests.map((pentest: any) => (
                <Link
                  key={pentest.id}
                  href={`/pentests/${pentest.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{pentest.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={pentest.status === 'IN_PROGRESS' ? 'warning' : 'default'}>
                        {pentest.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {pentest.progress}% complete
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Started: {new Date(pentest.startDate).toLocaleDateString()}</p>
                    <p>End: {new Date(pentest.endDate).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No active pentests yet
              </p>
              <Link href="/pentests/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Your First Pentest
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/pentests/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4" />
                New Pentest
              </Button>
            </Link>
            <Link href="/targets/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4" />
                Add Target
              </Button>
            </Link>
            <Link href="/findings">
              <Button variant="outline" className="w-full justify-start">
                <Bug className="h-4 w-4" />
                View Findings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
