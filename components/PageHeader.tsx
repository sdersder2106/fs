'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link
            href="/dashboard"
            className="hover:text-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-700 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header content */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-gray-500">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="ml-6 flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
