'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  hint?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const Radio = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="radio"
        className={cn(
          'h-4 w-4 border-2 border-gray-300 text-primary-600',
          'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

Radio.displayName = 'Radio';

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  hint,
  required,
  disabled,
  orientation = 'vertical',
  className,
}) => {
  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (optionValue: string) => {
    if (!disabled && onChange) {
      onChange(optionValue);
    }
  };

  return (
    <fieldset className={cn('relative', className)}>
      {label && (
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}

      <div
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-4'
        )}
        role="radiogroup"
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${groupId}-error` : hint ? `${groupId}-hint` : undefined
        }
      >
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <div key={option.value} className="flex items-start">
              <div className="flex items-center h-5">
                <Radio
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  onChange={() => handleChange(option.value)}
                  disabled={isDisabled}
                  required={required && !value}
                />
              </div>
              <div className="ml-2">
                <label
                  htmlFor={optionId}
                  className={cn(
                    'text-sm text-gray-700 cursor-pointer select-none',
                    isDisabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {option.label}
                </label>
                {option.hint && (
                  <p className="text-xs text-gray-500 mt-0.5">{option.hint}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          id={`${groupId}-error`}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {hint && !error && (
        <p id={`${groupId}-hint`} className="mt-2 text-sm text-gray-500">
          {hint}
        </p>
      )}
    </fieldset>
  );
};

export { Radio, RadioGroup };
