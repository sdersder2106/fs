'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'critical' | 'high' | 'medium' | 'low';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      rounded = false,
      removable = false,
      onRemove,
      icon,
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center font-medium border transition-colors';

    const variants = {
      default: 'bg-gray-50 text-gray-700 border-gray-300',
      success: 'bg-green-50 text-green-700 border-green-200',
      warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      danger: 'bg-red-50 text-red-700 border-red-200',
      info: 'bg-blue-50 text-blue-700 border-blue-200',
      
      // Severity variants
      critical: 'bg-red-50 text-red-700 border-red-200',
      high: 'bg-orange-50 text-orange-700 border-orange-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      low: 'bg-blue-50 text-blue-700 border-blue-200',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-3.5 h-3.5',
      lg: 'w-4 h-4',
    };

    const dotColors = {
      default: 'bg-gray-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      info: 'bg-blue-500',
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          rounded ? 'rounded-full' : 'rounded-md',
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'rounded-full mr-1.5',
              size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5',
              dotColors[variant]
            )}
          />
        )}
        
        {icon && (
          <span className={cn(iconSizes[size], 'mr-1')}>{icon}</span>
        )}
        
        {children}
        
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className={cn(
              'ml-1 -mr-0.5 hover:opacity-75 focus:outline-none',
              iconSizes[size]
            )}
          >
            <X className="w-full h-full" />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
