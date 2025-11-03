"use client";

import { Shield, Target, AlertCircle, TrendingUp } from "lucide-react";
import StatCard from "@/components/cards/StatCard";
import { VulnerabilitySeverityChart } from '@/components/charts/VulnerabilitySeverityChart';
import { ComplianceCard } from '@/components/cards/ComplianceCard';
import { VulnerabilityBreakdownChart } from '@/components/charts/VulnerabilityBreakdownChart';
import { RecentActivity } from '@/components/lists/RecentActivity';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, here&apos;s an overview of your security posture
        </p>
      </div>

      {/* Stats Cards Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pentests */}
        <StatCard
          title="Total Pentests"
          value={3}
          subtitle="3 In Progress"
          icon={Shield}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />

        {/* Targets */}
        <StatCard
          title="Targets"
          value={12}
          subtitle="3 Active"
          icon={Target}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />

        {/* Vulnerabilities */}
        <StatCard
          title="Vulnerabilities"
          value={18}
          subtitle="3 Open"
          icon={AlertCircle}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />

        {/* Critical */}
        <StatCard
          title="Critical"
          value={6}
          subtitle="Urgent Action"
          icon={TrendingUp}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
      </div>

      {/* Charts Grid - 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vulnerability Severity Chart - Radar */}
        <div className="lg:col-span-1">
          <VulnerabilitySeverityChart />
        </div>

        {/* Compliance Card - Grid with icons */}
        <div className="lg:col-span-1">
          <ComplianceCard />
        </div>

        {/* Vulnerability Breakdown - Donut */}
        <div className="lg:col-span-1">
          <VulnerabilityBreakdownChart />
        </div>
      </div>

      {/* Recent Activity - Full width */}
      <div>
        <RecentActivity />
      </div>
    </div>
  );
}
