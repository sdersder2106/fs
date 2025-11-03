'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'bg-gray-200';

    const variants = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: '',
      rounded: 'rounded-lg',
    };

    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: '',
    };

    const defaultSizes = {
      text: { height: '1em', width: '100%' },
      circular: { height: '40px', width: '40px' },
      rectangular: { height: '100px', width: '100%' },
      rounded: { height: '100px', width: '100%' },
    };

    const finalWidth = width || defaultSizes[variant].width;
    const finalHeight = height || defaultSizes[variant].height;

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          animations[animation],
          className
        )}
        style={{
          width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
          height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton variants for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-xl p-6', className)}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex space-x-2 mt-4">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" width="100px" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={colIndex === 0 ? '150px' : '100px'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1">
            <Skeleton variant="text" width="70%" className="mb-1" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonForm: React.FC<{ fields?: number; className?: string }> = ({
  fields = 4,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton variant="text" width="100px" className="mb-2" />
          <Skeleton variant="rounded" height={40} />
        </div>
      ))}
      <div className="flex space-x-3 pt-4">
        <Skeleton variant="rounded" width={100} height={40} />
        <Skeleton variant="rounded" width={100} height={40} />
      </div>
    </div>
  );
};

export { Skeleton };
