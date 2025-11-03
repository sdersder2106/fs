'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import {
  Shield,
  Bug,
  Target,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'pentest' | 'finding' | 'target' | 'report' | 'comment';
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'started' | 'resolved';
  title: string;
  description?: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date | string;
  link?: string;
  metadata?: {
    severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    status?: string;
  };
}

interface RecentActivityProps {
  items: ActivityItem[];
  maxItems?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  items,
  maxItems = 10,
  showViewAll = true,
  viewAllLink = '/dashboard/activity',
  className,
}) => {
  const displayItems = items.slice(0, maxItems);

  const getIcon = (type: ActivityItem['type'], action: ActivityItem['action']) => {
    const iconMap = {
      pentest: <Shield className="w-4 h-4" />,
      finding: <Bug className="w-4 h-4" />,
      target: <Target className="w-4 h-4" />,
      report: <FileText className="w-4 h-4" />,
      comment: <MessageSquare className="w-4 h-4" />,
    };
    return iconMap[type];
  };

  const getActionIcon = (action: ActivityItem['action']) => {
    const actionMap = {
      created: <AlertCircle className="w-3 h-3" />,
      updated: <Clock className="w-3 h-3" />,
      deleted: <XCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      started: <AlertCircle className="w-3 h-3" />,
      resolved: <CheckCircle className="w-3 h-3" />,
    };
    return actionMap[action];
  };

  const getActionColor = (action: ActivityItem['action']) => {
    const colorMap = {
      created: 'bg-blue-100 text-blue-600',
      updated: 'bg-yellow-100 text-yellow-600',
      deleted: 'bg-red-100 text-red-600',
      completed: 'bg-green-100 text-green-600',
      started: 'bg-blue-100 text-blue-600',
      resolved: 'bg-green-100 text-green-600',
    };
    return colorMap[action];
  };

  const getSeverityColor = (severity?: string) => {
    const colorMap = {
      CRITICAL: 'text-red-600',
      HIGH: 'text-orange-600',
      MEDIUM: 'text-yellow-600',
      LOW: 'text-blue-600',
      INFO: 'text-gray-600',
    };
    return severity ? colorMap[severity as keyof typeof colorMap] : '';
  };

  if (displayItems.length === 0) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {displayItems.map((item) => (
        <div
          key={item.id}
          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {item.user.avatar ? (
              <img
                src={item.user.avatar}
                alt={item.user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className={cn('p-1 rounded', getActionColor(item.action))}>
                    {getIcon(item.type, item.action)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.user.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.action}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.type}
                  </span>
                </div>
                
                <div className="mt-1">
                  {item.link ? (
                    <Link
                      href={item.link}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-gray-900">
                      {item.title}
                    </span>
                  )}
                  
                  {item.metadata?.severity && (
                    <span
                      className={cn(
                        'ml-2 text-xs font-medium',
                        getSeverityColor(item.metadata.severity)
                      )}
                    >
                      {item.metadata.severity}
                    </span>
                  )}
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <span className="text-xs text-gray-400">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {showViewAll && items.length > maxItems && (
        <div className="pt-4 border-t border-gray-200">
          <Link
            href={viewAllLink}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all activity ({items.length} total) →
          </Link>
        </div>
      )}
    </div>
  );
};
