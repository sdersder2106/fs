'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck,
  AlertCircle,
  MessageSquare,
  FileText,
  Shield,
  Bug,
  ExternalLink,
  Info,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS = {
  info: Info,
  success: Check,
  warning: AlertCircle,
  error: AlertCircle,
  finding: Bug,
  pentest: Shield,
  report: FileText,
  comment: MessageSquare,
};

const NOTIFICATION_COLORS = {
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
  finding: 'bg-orange-100 text-orange-600',
  pentest: 'bg-indigo-100 text-indigo-600',
  report: 'bg-purple-100 text-purple-600',
  comment: 'bg-gray-100 text-gray-600',
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    connected 
  } = useWebSocket({
    autoConnect: true,
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.read
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  // Clear all notifications
  const handleClearAll = () => {
    markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Connection Status Indicator */}
        <span className={cn(
          "absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white",
          connected ? "bg-green-400" : "bg-gray-400"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center space-x-4 mt-2">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "text-sm font-medium pb-1 border-b-2 transition-colors",
                  filter === 'all'
                    ? "text-indigo-600 border-indigo-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                )}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={cn(
                  "text-sm font-medium pb-1 border-b-2 transition-colors",
                  filter === 'unread'
                    ? "text-indigo-600 border-indigo-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                )}
              >
                Unread ({unreadCount})
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="ml-auto text-xs text-indigo-600 hover:text-indigo-500 flex items-center"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const Icon = NOTIFICATION_ICONS[notification.type] || Info;
                  const colorClass = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.info;
                  
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors flex items-start space-x-3",
                        !notification.read && "bg-blue-50"
                      )}
                    >
                      {/* Icon */}
                      <div className={cn("p-2 rounded-lg flex-shrink-0", colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={cn(
                              "text-sm font-medium text-gray-900",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          
                          {/* Link indicator */}
                          {notification.link && (
                            <ExternalLink className="h-3 w-3 text-gray-400 ml-2 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      
                      {/* Unread dot */}
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <span className="inline-block h-2 w-2 bg-blue-600 rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <Link
                href="/dashboard/notifications"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}