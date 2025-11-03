'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      hint,
      indeterminate = false,
      disabled,
      required,
      id,
      checked,
      ...props
    },
    ref
  ) => {
    const checkboxRef = React.useRef<HTMLInputElement | null>(null);
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const setRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        checkboxRef.current = node;
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      },
      [ref]
    );

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const baseCheckboxStyles = cn(
      'peer sr-only'
    );

    const boxStyles = cn(
      'relative h-5 w-5 rounded border-2 transition-all',
      'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      error
        ? 'border-red-500 peer-checked:bg-red-500 peer-checked:border-red-500'
        : 'border-gray-300 peer-checked:bg-primary-600 peer-checked:border-primary-600',
    );

    return (
      <div className="relative">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={setRef}
              id={checkboxId}
              type="checkbox"
              className={cn(baseCheckboxStyles, className)}
              disabled={disabled}
              required={required}
              checked={checked}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${checkboxId}-error` : hint ? `${checkboxId}-hint` : undefined
              }
              {...props}
            />
            <label
              htmlFor={checkboxId}
              className={cn(
                boxStyles,
                'cursor-pointer',
                disabled && 'cursor-not-allowed'
              )}
            >
              <Check
                className={cn(
                  'absolute inset-0 h-full w-full text-white p-0.5',
                  'transition-opacity',
                  checked ? 'opacity-100' : 'opacity-0'
                )}
              />
              {indeterminate && !checked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-3 bg-gray-600" />
                </div>
              )}
            </label>
          </div>

          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'ml-2 text-sm text-gray-700 cursor-pointer select-none',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>

        {error && (
          <div
            id={`${checkboxId}-error`}
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {hint && !error && (
          <p id={`${checkboxId}-hint`} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
