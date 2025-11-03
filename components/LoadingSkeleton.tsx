'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonList, SkeletonForm } from '@/components/ui/Skeleton';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'form' | 'custom';
  count?: number;
  className?: string;
  children?: React.ReactNode;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className,
  children,
}) => {
  if (variant === 'custom' && children) {
    return <div className={className}>{children}</div>;
  }

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        );
      
      case 'list':
        return <SkeletonList items={count} />;
      
      case 'table':
        return <SkeletonTable rows={count} />;
      
      case 'form':
        return <SkeletonForm fields={count} />;
      
      default:
        return null;
    }
  };

  return (
    <div className={cn('animate-fade-in', className)}>
      {renderSkeleton()}
    </div>
  );
};

export default LoadingSkeleton;
