'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'pills' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export interface TabPanelProps {
  tabId: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  size = 'md',
  fullWidth = false,
  className,
}) => {
  const baseContainerStyles = cn(
    'flex',
    variant === 'enclosed' && 'border-b border-gray-200',
    fullWidth && 'w-full'
  );

  const baseTabStyles = cn(
    'relative inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    fullWidth && 'flex-1'
  );

  const variants = {
    line: {
      container: 'border-b border-gray-200 space-x-6',
      tab: 'pb-3 border-b-2 border-transparent hover:text-gray-700',
      activeTab: 'text-primary-600 border-primary-600',
      inactiveTab: 'text-gray-500',
    },
    pills: {
      container: 'gap-2 p-1 bg-gray-100 rounded-lg',
      tab: 'px-4 py-2 rounded-md hover:bg-gray-200',
      activeTab: 'bg-white text-primary-600 shadow-sm',
      inactiveTab: 'text-gray-600',
    },
    enclosed: {
      container: 'gap-1 -mb-px',
      tab: 'px-4 py-2 border border-transparent rounded-t-lg hover:text-gray-700',
      activeTab: 'bg-white text-primary-600 border-gray-200 border-b-white',
      inactiveTab: 'text-gray-500',
    },
  };

  const sizes = {
    sm: variant === 'line' ? 'text-xs' : 'text-xs py-1.5 px-3',
    md: variant === 'line' ? 'text-sm' : 'text-sm py-2 px-4',
    lg: variant === 'line' ? 'text-base' : 'text-base py-2.5 px-5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={cn(baseContainerStyles, variants[variant].container, className)}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(tab.id)}
            className={cn(
              baseTabStyles,
              variants[variant].tab,
              sizes[size],
              isActive
                ? variants[variant].activeTab
                : variants[variant].inactiveTab
            )}
          >
            {tab.icon && (
              <span className={cn(iconSizes[size], 'mr-2')}>{tab.icon}</span>
            )}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 text-xs font-medium rounded-full',
                  isActive
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const TabPanel: React.FC<TabPanelProps> = ({
  tabId,
  activeTab,
  children,
  className,
}) => {
  if (tabId !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      className={cn('animate-fade-in', className)}
    >
      {children}
    </div>
  );
};

export { Tabs, TabPanel };
