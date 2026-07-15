import React, { forwardRef, useState } from 'react';
import { cn } from '../../../lib/cn';
import { Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: LucideIcon;
  suffixIcon?: LucideIcon;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      type = 'text',
      label,
      error,
      success,
      icon: Icon,
      suffixIcon: SuffixIcon,
      helperText,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="relative w-full mb-3 flex flex-col items-stretch">
        <div className="relative flex items-center h-[42px] w-full">
          {Icon && (
            <div className="absolute left-3.5 text-slate-500 pointer-events-none z-10 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
          )}
          
          <input
            id={id}
            type={inputType}
            ref={ref}
            disabled={disabled}
            placeholder=" "
            className={cn(
              "w-full h-full text-slate-800 bg-white border rounded-[14px] transition-all duration-300 outline-none peer text-[13px] pt-[15px] pb-[1px]",
              "autofill:shadow-[0_0_0_1000px_white_inset] autofill:text-slate-800",
              Icon ? "pl-[40px]" : "px-3.5",
              isPassword || SuffixIcon ? "pr-[40px]" : "pr-3.5",
              error 
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100/50" 
                : success
                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100/50"
                  : "border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100/50",
              disabled && "bg-slate-50 border-slate-300 text-slate-400 cursor-not-allowed",
              className
            )}
            {...props}
          />
          
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "absolute text-slate-500 text-xs transition-all duration-200 ease-in-out pointer-events-none origin-left px-1.5 rounded z-10",
                Icon ? "left-9" : "left-3",
                "top-1/2 -translate-y-1/2 scale-100 bg-transparent",
                "peer-focus:top-[5px] peer-focus:translate-y-0 peer-focus:scale-85 peer-focus:text-blue-600 peer-focus:font-semibold peer-focus:bg-white",
                "peer-[:not(:placeholder-shown)]:top-[5px] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-85 peer-[:not(:placeholder-shown)]:text-slate-500 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:bg-white",
                "peer-autofill:top-[5px] peer-autofill:translate-y-0 peer-autofill:scale-85 peer-autofill:text-slate-500 peer-autofill:font-semibold peer-autofill:bg-white",
                error && "peer-focus:text-red-500",
                success && "peer-focus:text-emerald-500"
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}

          {isPassword && !disabled && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 p-1 text-slate-500 hover:text-slate-700 focus:outline-none transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {!isPassword && SuffixIcon && (
            <div className="absolute right-3.5 text-slate-500 pointer-events-none">
              <SuffixIcon className="w-4 h-4" />
            </div>
          )}
        </div>

        {error && (
          <span className="text-red-500 text-[10.5px] font-semibold mt-1 pl-1.5 self-start" id={`${id}-error`}>
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

Input.displayName = 'Input';
export default Input;
