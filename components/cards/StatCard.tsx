'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
  className,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) {
      return <ArrowUp className="w-4 h-4" />;
    } else if (trend.value < 0) {
      return <ArrowDown className="w-4 h-4" />;
    }
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.value > 0) {
      return 'text-green-600';
    } else if (trend.value < 0) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const variantStyles = {
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  };

  const iconColors = {
    default: 'text-gray-600 bg-gray-100',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-6 transition-all hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          
          {trend && (
            <div className={cn('flex items-center mt-3', getTrendColor())}>
              {getTrendIcon()}
              <span className="ml-1 text-sm font-medium">
                {Math.abs(trend.value)}%
              </span>
              <span className="ml-2 text-sm text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div
            className={cn(
              'p-3 rounded-lg',
              iconColors[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
