import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
}

export function RadioGroup({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  error,
  orientation = 'vertical',
  disabled = false,
}: RadioGroupProps) {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (optionValue: string) => {
    if (disabled) return;
    setSelectedValue(optionValue);
    onChange?.(optionValue);
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Radio options */}
      <div className={cn(
        "space-y-3",
        orientation === 'horizontal' && "flex gap-4 space-y-0"
      )}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 cursor-pointer",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              {/* Hidden native radio */}
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => handleChange(option.value)}
                disabled={isDisabled}
                className="sr-only"
              />

              {/* Custom radio */}
              <div className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
                isSelected
                  ? "border-blue-600"
                  : "border-gray-300 hover:border-gray-400",
                error && "border-red-500"
              )}>
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                )}
              </div>

              {/* Label and description */}
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
