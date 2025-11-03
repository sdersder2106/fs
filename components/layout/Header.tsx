'use client';

import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { CompanySelector } from './CompanySelector';
import { useCompany } from '@/contexts/CompanyContext';

interface HeaderProps {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'CLIENT';
    avatar?: string;
    companyName?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const { userRole } = useCompany();

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left side - Search (future) */}
        <div className="flex items-center gap-4 flex-1">
          {/* Search bar - placeholder for now */}
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search pentests, vulnerabilities..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Middle - Company Selector (ADMIN ONLY) */}
        <div className="flex items-center gap-4 mx-6">
          {userRole === 'ADMIN' ? (
            <div className="w-72">
              <CompanySelector />
            </div>
          ) : (
            // CLIENT - Show their company name
            user?.companyName && (
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {user.companyName}
                </span>
              </div>
            )
          )}
        </div>

        {/* Right side - Notifications & User */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            {/* Avatar */}
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.fullName} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-blue-600" />
              )}
            </div>

            {/* User info */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user?.fullName || 'User'}
              </span>
              <span className="text-xs text-gray-500">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Client'}
              </span>
            </div>

            {/* Logout button */}
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
