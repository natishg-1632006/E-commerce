import React, { forwardRef } from 'react';
import { cn } from '../../../lib/cn';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, id, label, disabled, ...props }, ref) => {
    return (
      <label className="inline-flex items-center select-none cursor-pointer group mb-2.5">
        <div className="relative flex items-center">
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
              "w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100/50 rounded-full transition-colors duration-250",
              "peer-checked:bg-blue-600",
              disabled && "bg-slate-100 cursor-not-allowed peer-checked:bg-slate-300"
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-250",
              "peer-checked:translate-x-4",
              disabled && "bg-slate-200 cursor-not-allowed"
            )}
          />
        </div>
        {label && (
          <span
            className={cn(
              "ml-2.5 text-xs font-semibold text-slate-600 transition-colors",
              disabled && "text-slate-400 cursor-not-allowed"
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
export default Switch;
