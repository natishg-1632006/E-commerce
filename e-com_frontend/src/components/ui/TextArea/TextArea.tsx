import React, { forwardRef } from 'react';
import { cn } from '../../../lib/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      id,
      label,
      error,
      helperText,
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full mb-3 flex flex-col items-stretch">
        <div className="relative flex items-stretch w-full">
          <textarea
            id={id}
            ref={ref}
            disabled={disabled}
            rows={rows}
            placeholder=" "
            className={cn(
              "w-full text-slate-800 bg-white border border-slate-400 rounded-[14px] transition-all duration-300 outline-none peer text-[13px] pt-5 pb-1.5 px-3.5 resize-y",
              error && "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100/50",
              !error && "focus:border-blue-600 focus:ring-2 focus:ring-blue-100/50",
              disabled && "bg-slate-50 border-slate-300 text-slate-400 cursor-not-allowed",
              className
            )}
            {...props}
          />
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "absolute text-slate-500 text-xs transition-all duration-200 ease-in-out pointer-events-none origin-left px-1.5 rounded z-10 left-3",
                "top-[13px] scale-100 bg-transparent",
                "peer-focus:top-1.5 peer-focus:scale-85 peer-focus:text-blue-600 peer-focus:font-semibold peer-focus:bg-white",
                "peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:scale-85 peer-[:not(:placeholder-shown)]:text-slate-500 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:bg-white",
                error && "peer-focus:text-red-500"
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
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

TextArea.displayName = 'TextArea';
export default TextArea;
