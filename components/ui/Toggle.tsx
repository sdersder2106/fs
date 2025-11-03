'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  labelPosition?: 'left' | 'right';
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      className,
      label,
      error,
      hint,
      size = 'md',
      labelPosition = 'right',
      disabled,
      required,
      id,
      checked,
      ...props
    },
    ref
  ) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

    const sizes = {
      sm: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: 'translate-x-4',
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: 'translate-x-5',
      },
      lg: {
        track: 'h-7 w-14',
        thumb: 'h-6 w-6',
        translate: 'translate-x-7',
      },
    };

    const baseTrackStyles = cn(
      'relative inline-flex shrink-0 cursor-pointer rounded-full',
      'border-2 border-transparent transition-colors duration-200 ease-in-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      disabled && 'cursor-not-allowed opacity-50',
      error ? 'bg-red-200' : checked ? 'bg-primary-600' : 'bg-gray-200',
      sizes[size].track
    );

    const baseThumbStyles = cn(
      'pointer-events-none inline-block rounded-full bg-white shadow-lg',
      'ring-0 transition-transform duration-200 ease-in-out',
      sizes[size].thumb,
      checked ? sizes[size].translate : 'translate-x-0'
    );

    const content = (
      <>
        {label && labelPosition === 'left' && (
          <label
            htmlFor={toggleId}
            className={cn(
              'text-sm text-gray-700 cursor-pointer select-none mr-3',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${toggleId}-label` : undefined}
          onClick={() => {
            const input = document.getElementById(toggleId) as HTMLInputElement;
            if (input && !disabled) {
              const event = new Event('change', { bubbles: true });
              input.checked = !input.checked;
              input.dispatchEvent(event);
            }
          }}
          className={baseTrackStyles}
          disabled={disabled}
        >
          <span className={baseThumbStyles} />
        </button>

        {label && labelPosition === 'right' && (
          <label
            htmlFor={toggleId}
            id={`${toggleId}-label`}
            className={cn(
              'text-sm text-gray-700 cursor-pointer select-none ml-3',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={toggleId}
          type="checkbox"
          className="sr-only"
          disabled={disabled}
          required={required}
          checked={checked}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${toggleId}-error` : hint ? `${toggleId}-hint` : undefined
          }
          {...props}
        />
      </>
    );

    return (
      <div className="relative">
        <div className="flex items-center">{content}</div>

        {error && (
          <div
            id={`${toggleId}-error`}
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {hint && !error && (
          <p id={`${toggleId}-hint`} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
