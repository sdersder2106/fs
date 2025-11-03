'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Target,
  Shield,
  Bug,
  FileText,
  Bell,
  Settings,
  Building,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Menu,
  X,
  Folder,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  requiredRole?: string[];
  children?: NavItem[];
}

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  companyName?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  companyName = 'Base44',
  collapsed = false,
  onToggleCollapse,
  className,
}) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Pentests',
      href: '/dashboard/pentests',
      icon: <Shield className="w-5 h-5" />,
      badge: 3,
    },
    {
      label: 'Targets',
      href: '/dashboard/targets',
      icon: <Target className="w-5 h-5" />,
    },
    {
      label: 'Findings',
      href: '/dashboard/findings',
      icon: <Bug className="w-5 h-5" />,
      badge: 12,
    },
    {
      label: 'Reports',
      href: '/dashboard/reports',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: 'Templates',
      href: '/dashboard/templates',
      icon: <Folder className="w-5 h-5" />,
      requiredRole: ['ADMIN'],
    },
    {
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: 5,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: 'Company',
      href: '/dashboard/company-settings',
      icon: <Building className="w-5 h-5" />,
      requiredRole: ['ADMIN'],
    },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredRole || !user) return true;
    return item.requiredRole.includes(user.role);
  });

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);

    const content = (
      <>
        <span className="flex items-center flex-1">
          {item.icon}
          {!collapsed && (
            <span className="ml-3">{item.label}</span>
          )}
        </span>
        {!collapsed && item.badge && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-600">
            {item.badge}
          </span>
        )}
        {!collapsed && hasChildren && (
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        )}
      </>
    );

    const itemClasses = cn(
      'flex items-center px-3 py-2 rounded-lg transition-colors',
      'hover:bg-gray-100',
      active && 'bg-primary-50 text-primary-600 font-medium',
      !active && 'text-gray-700',
      depth > 0 && 'ml-6'
    );

    if (hasChildren && !collapsed) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(itemClasses, 'w-full text-left')}
          >
            {content}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children!.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        className={itemClasses}
        title={collapsed ? item.label : undefined}
      >
        {content}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200">
        <Link 
          href="/dashboard" 
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900">{companyName}</span>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-gray-100 lg:block hidden"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll">
        {filteredNavItems.map(item => renderNavItem(item))}
      </nav>

      {/* User section */}
      {user && (
        <div className="border-t border-gray-200 p-3">
          <div className={cn(
            'flex items-center',
            collapsed ? 'justify-center' : 'space-x-3'
          )}>
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => {
                  // Handle logout
                  window.location.href = '/login';
                }}
                className="p-1 rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
      >
        {mobileOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Spacer for desktop */}
      <div 
        className={cn(
          'hidden lg:block transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      />
    </>
  );
};
