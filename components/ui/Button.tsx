'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border border-transparent',
      secondary: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 border border-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-transparent',
      link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline focus:ring-primary-500 border border-transparent p-0',
    };

    const sizes = {
      sm: variant === 'link' ? 'text-sm' : 'px-3 py-1.5 text-sm',
      md: variant === 'link' ? 'text-base' : 'px-4 py-2 text-sm',
      lg: variant === 'link' ? 'text-lg' : 'px-6 py-3 text-base',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const LoadingIcon = <Loader2 className={cn(iconSizes[size], 'animate-spin')} />;
    const displayIcon = loading ? LoadingIcon : icon;

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {displayIcon && iconPosition === 'left' && (
          <span className={cn(children && 'mr-2', iconSizes[size])}>
            {displayIcon}
          </span>
        )}
        {children}
        {displayIcon && iconPosition === 'right' && (
          <span className={cn(children && 'ml-2', iconSizes[size])}>
            {displayIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
