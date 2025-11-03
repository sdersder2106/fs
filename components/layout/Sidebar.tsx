'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Shield, 
  Target, 
  AlertCircle, 
  FileText, 
  CheckCircle, 
  Settings,
  Library,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

function SidebarItem({ href, icon: Icon, label, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
        "text-gray-300 hover:bg-sidebar-item hover:text-white",
        isActive && "bg-blue-600 text-white font-medium"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </Link>
  );
}

interface SidebarProps {
  userRole?: 'ADMIN' | 'CLIENT';
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { 
      href: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      roles: ['ADMIN', 'CLIENT']
    },
    { 
      href: '/dashboard/pentests', 
      icon: Shield, 
      label: 'Pentests',
      roles: ['ADMIN', 'CLIENT']
    },
    { 
      href: '/dashboard/targets', 
      icon: Target, 
      label: 'Targets',
      roles: ['ADMIN', 'CLIENT']
    },
    { 
      href: '/dashboard/vulnerabilities', 
      icon: AlertCircle, 
      label: 'Vulnerabilities',
      roles: ['ADMIN', 'CLIENT']
    },
    { 
      href: '/dashboard/reports', 
      icon: FileText, 
      label: 'Reports',
      roles: ['ADMIN', 'CLIENT']
    },
    { 
      href: '/dashboard/compliance', 
      icon: CheckCircle, 
      label: 'Compliance',
      roles: ['ADMIN', 'CLIENT']
    },
    { 
      href: '/dashboard/templates', 
      icon: Library, 
      label: 'Templates',
      roles: ['ADMIN'] // ADMIN only
    },
    { 
      href: '/dashboard/notifications', 
      icon: Bell, 
      label: 'Notifications',
      roles: ['ADMIN', 'CLIENT']
    },
    { 
      href: '/dashboard/settings', 
      icon: Settings, 
      label: 'Settings',
      roles: ['ADMIN', 'CLIENT']
    },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar-bg border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Base44</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNavigation.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* User info footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 text-gray-400 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>
            {userRole === 'ADMIN' ? 'Admin Mode' : 'Client Mode'}
          </span>
        </div>
      </div>
    </aside>
  );
}
