import React, { forwardRef } from 'react';
import { cn } from '../../../lib/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      id,
      label,
      options,
      error,
      helperText,
      placeholder = 'Select an option',
      required,
      disabled,
      defaultValue = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full mb-3 flex flex-col items-stretch">
        <div className="relative flex items-center h-[42px] w-full">
          <select
            id={id}
            ref={ref}
            disabled={disabled}
            defaultValue={defaultValue}
            className={cn(
              "w-full h-full text-slate-800 bg-white border border-slate-400 rounded-[14px] transition-all duration-300 outline-none peer text-[13px] pt-[15px] pb-[1px] px-3.5 appearance-none cursor-pointer",
              error && "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100/50",
              !error && "focus:border-blue-600 focus:ring-2 focus:ring-blue-100/50",
              disabled && "bg-slate-50 border-slate-300 text-slate-400 cursor-not-allowed",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {label && (
            <label
              htmlFor={id}
              className={cn(
                "absolute text-slate-500 text-xs transition-all duration-200 ease-in-out pointer-events-none origin-left px-1.5 rounded z-10 left-3",
                "top-1/2 -translate-y-1/2 scale-100 bg-transparent",
                "peer-focus:top-[5px] peer-focus:translate-y-0 peer-focus:scale-85 peer-focus:text-blue-600 peer-focus:font-semibold peer-focus:bg-white",
                "peer-[:not(:placeholder-shown)]:top-[5px] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-85 peer-[:not(:placeholder-shown)]:text-slate-500 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:bg-white",
                error && "peer-focus:text-red-500"
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}

          <div className="absolute right-3.5 text-slate-500 pointer-events-none flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <span className="text-red-500 text-[10.5px] font-semibold mt-1 pl-1.5 self-start">
            {error}
          </span>
        )}

        {!error && helperText && (
          <span className="text-slate-400 text-[10.5px] font-medium mt-1 pl-1.5 self-start">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
