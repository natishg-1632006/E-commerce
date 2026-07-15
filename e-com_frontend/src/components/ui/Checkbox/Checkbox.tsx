import React, { forwardRef } from 'react';
import { cn } from '../../../lib/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, label, error, disabled, ...props }, ref) => {
    return (
      <div className="flex flex-col items-start mb-2.5">
        <label className="inline-flex items-start select-none cursor-pointer group">
          <div className="relative flex items-center mt-0.5">
            <input
              id={id}
              type="checkbox"
              ref={ref}
              disabled={disabled}
              className="sr-only peer"
              {...props}
            />
            <div
              className={cn(
                "w-[18px] h-[18px] border border-slate-450 rounded-[6px] transition-all duration-200 flex items-center justify-center bg-white",
                "group-hover:border-blue-500",
                "peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-checked:[&_svg]:scale-100",
                "peer-focus:ring-2 peer-focus:ring-blue-100/50",
                error && "border-red-500 peer-checked:bg-red-500 peer-checked:border-red-500 group-hover:border-red-500",
                disabled && "bg-slate-150 border-slate-300 cursor-not-allowed peer-checked:bg-slate-350 peer-checked:border-slate-350 group-hover:border-slate-300"
              )}
            >
              <Check className="w-[11px] h-[11px] text-white stroke-[3.5px] scale-0 transition-transform duration-200" />
            </div>
          </div>
          {label && (
            <span
              className={cn(
                "ml-2 text-xs font-semibold text-slate-600 transition-colors",
                disabled && "text-slate-400 cursor-not-allowed"
              )}
            >
              {label}
            </span>
          )}
        </label>
        {error && (
          <span className="text-red-500 text-[10.5px] font-semibold mt-1 pl-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
