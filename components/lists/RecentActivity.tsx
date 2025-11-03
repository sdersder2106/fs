'use client';

import React from 'react';
import { 
  AlertCircle, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { cn, getRelativeTime } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'vulnerability' | 'comment' | 'report' | 'status_change';
  title: string;
  description: string;
  time: string | Date;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  user?: {
    name: string;
    avatar?: string;
  };
}

interface RecentActivityProps {
  activities?: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Default demo data
  const defaultActivities: Activity[] = [
    {
      id: '1',
      type: 'vulnerability',
      title: 'New Critical Vulnerability',
      description: 'SQL Injection found in search parameter',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      severity: 'critical',
      user: { name: 'John Pentester' }
    },
    {
      id: '2',
      type: 'comment',
      title: 'Comment on XSS vulnerability',
      description: 'Starting remediation work on this issue',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      user: { name: 'Jane Client' }
    },
    {
      id: '3',
      type: 'status_change',
      title: 'Vulnerability status changed',
      description: 'IDOR vulnerability marked as resolved',
      time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      user: { name: 'Bob Developer' }
    },
    {
      id: '4',
      type: 'report',
      title: 'Report generated',
      description: 'Q4 2024 Penetration Test Report completed',
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      user: { name: 'John Pentester' }
    },
  ];

  const activityData = activities || defaultActivities;

  const getIcon = (type: string, severity?: string) => {
    switch (type) {
      case 'vulnerability':
        return { 
          icon: AlertTriangle, 
          color: severity === 'critical' ? 'text-red-600' : 'text-orange-600',
          bg: severity === 'critical' ? 'bg-red-100' : 'bg-orange-100'
        };
      case 'comment':
        return { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'report':
        return { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'status_change':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Activity
        </h3>
      </div>

      <div className="space-y-4">
        {activityData.map((activity) => {
          const iconConfig = getIcon(activity.type, activity.severity);
          const Icon = iconConfig.icon;

          return (
            <div 
              key={activity.id}
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                iconConfig.bg
              )}>
                <Icon className={cn("w-5 h-5", iconConfig.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {activity.user && (
                    <>
                      <span className="text-xs text-gray-500">
                        {activity.user.name}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                    </>
                  )}
                  <span className="text-xs text-gray-500">
                    {getRelativeTime(activity.time)}
                  </span>
                </div>
              </div>

              {/* Severity badge (if applicable) */}
              {activity.severity && (
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 self-start",
                  activity.severity === 'critical' && "bg-red-100 text-red-700",
                  activity.severity === 'high' && "bg-orange-100 text-orange-700",
                  activity.severity === 'medium' && "bg-yellow-100 text-yellow-700",
                  activity.severity === 'low' && "bg-blue-100 text-blue-700"
                )}>
                  {activity.severity.toUpperCase()}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* View all link */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  );
}
