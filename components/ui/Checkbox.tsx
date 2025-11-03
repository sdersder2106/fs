import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      error,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState(props.checked || false);

    React.useEffect(() => {
      if (props.checked !== undefined) {
        setIsChecked(props.checked);
      }
    }, [props.checked]);

    return (
      <div className="w-full">
        <label className={cn(
          "flex items-start gap-3 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50"
        )}>
          {/* Hidden native checkbox */}
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            disabled={disabled}
            {...props}
            onChange={(e) => {
              setIsChecked(e.target.checked);
              props.onChange?.(e);
            }}
          />

          {/* Custom checkbox */}
          <div className={cn(
            "flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center transition-all",
            "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
            isChecked
              ? "bg-blue-600 border-blue-600"
              : "bg-white border-gray-300 hover:border-gray-400",
            error && "border-red-500",
            className
          )}>
            {isChecked && (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            )}
          </div>

          {/* Label and description */}
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <span className="text-sm font-medium text-gray-900">
                  {label}
                  {props.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              )}
              {description && (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          )}
        </label>

        {/* Error message */}
        {error && (
          <p className="mt-1 ml-8 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
