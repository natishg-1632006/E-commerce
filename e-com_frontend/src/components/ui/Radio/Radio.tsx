import React, { forwardRef } from 'react';
import { cn } from '../../../lib/cn';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, id, label, error, disabled, ...props }, ref) => {
    return (
      <div className="flex flex-col items-start mb-2.5">
        <label className="inline-flex items-center select-none cursor-pointer group">
          <div className="relative flex items-center">
            <input
              id={id}
              type="radio"
              ref={ref}
              disabled={disabled}
              className="sr-only peer"
              {...props}
            />
            <div
              className={cn(
                "w-[18px] h-[18px] border border-slate-400 rounded-full transition-all duration-200 flex items-center justify-center bg-white",
                "peer-checked:border-blue-600",
                "peer-focus:ring-2 peer-focus:ring-blue-100/50",
                error && "border-red-500 peer-checked:border-red-500",
                disabled && "bg-slate-50 border-slate-300 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full bg-blue-600 scale-0 peer-checked:scale-100 transition-transform duration-200",
                  error && "bg-red-500",
                  disabled && "bg-slate-300"
                )}
              />
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

Radio.displayName = 'Radio';
export default Radio;
