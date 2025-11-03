'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder = 'Select an option',
      fullWidth = false,
      disabled,
      required,
      id,
      size = 'md',
      value,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const baseSelectStyles = cn(
      'appearance-none w-full rounded-lg border bg-white text-sm transition-colors cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
      error
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300',
    );

    const sizes = {
      sm: 'h-8 px-3 pr-8 text-xs',
      md: 'h-10 px-3 pr-10 text-sm',
      lg: 'h-12 px-4 pr-12 text-base',
    };

    const iconSizes = {
      sm: 'h-4 w-4 right-2',
      md: 'h-5 w-5 right-3',
      lg: 'h-6 w-6 right-3',
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(baseSelectStyles, sizes[size], className)}
            disabled={disabled}
            required={required}
            value={value}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className={cn(
              'absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400',
              iconSizes[size]
            )}
          />
        </div>

        {error && (
          <div
            id={`${selectId}-error`}
            className="flex items-center mt-1 text-sm text-red-600"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        {hint && !error && (
          <p id={`${selectId}-hint`} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
