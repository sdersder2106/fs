'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  notifications?: number;
  onSearch?: (query: string) => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  notifications = 0,
  onSearch,
  className,
}) => {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('light');

  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const notificationsMenuRef = React.useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const recentNotifications = [
    {
      id: '1',
      title: 'New Critical Finding',
      message: 'SQL Injection vulnerability discovered',
      time: '5 minutes ago',
      type: 'error' as const,
    },
    {
      id: '2',
      title: 'Pentest Completed',
      message: 'Q4 2024 Security Assessment finished',
      time: '1 hour ago',
      type: 'success' as const,
    },
    {
      id: '3',
      title: 'Report Generated',
      message: 'Executive summary is ready',
      time: '3 hours ago',
      type: 'info' as const,
    },
  ];

  const themeIcons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    system: <Monitor className="w-4 h-4" />,
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200',
        className
      )}
    >
      {/* Left section - Search */}
      <div className="flex items-center flex-1 max-w-2xl">
        {searchOpen ? (
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pentests, findings, targets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false);
                }}
              />
            </div>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Search...</span>
          </button>
        )}
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center space-x-3">
        {/* Theme switcher */}
        <div className="relative">
          <button
            onClick={() => {
              const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(theme);
              const nextIndex = (currentIndex + 1) % themes.length;
              setTheme(themes[nextIndex]);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={`Theme: ${theme}`}
          >
            {themeIcons[theme]}
          </button>
        </div>

        {/* Notifications */}
        <div ref={notificationsMenuRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <Link
                    href="/dashboard/notifications"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-start space-x-3">
                        <Badge variant={notification.type} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile menu */}
        {user && (
          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => {
                      // Handle logout
                      window.location.href = '/login';
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
