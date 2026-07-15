import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  icon?: LucideIcon;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, id, icon: Icon, error, className, type = 'text', ...props }, ref) => {
    return (
      <div className="relative w-full mb-2">
        <div className="relative flex items-center h-[42px]">
          {Icon && (
            <div className="absolute left-3.5 text-slate-500 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            id={id}
            type={type}
            ref={ref}
            placeholder=" "
            className={clsx(
              "w-full h-full text-slate-800 bg-white border border-slate-400 rounded-[14px] transition-all duration-300 outline-none peer text-[13px] pt-[15px] pb-[1px]",
              "autofill:shadow-[0_0_0_1000px_white_inset] autofill:text-slate-800",
              Icon ? "pl-[40px] pr-3.5" : "px-3.5",
              error 
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100/50" 
                : "border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100/50",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
          <label
            htmlFor={id}
            className={clsx(
              "absolute text-slate-500 text-xs transition-all duration-200 ease-in-out pointer-events-none origin-left px-1.5 rounded",
              Icon ? "left-9" : "left-3",
              "top-1/2 -translate-y-1/2 scale-100 bg-transparent",
              
              // Focus state
              "peer-focus:top-[5px] peer-focus:translate-y-0 peer-focus:scale-85 peer-focus:text-blue-600 peer-focus:font-semibold peer-focus:bg-white",
              
              // Content filled state (non-empty value)
              "peer-[:not(:placeholder-shown)]:top-[5px] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-85 peer-[:not(:placeholder-shown)]:text-slate-500 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:bg-white",
              
              // Browser Autofill states
              "peer-autofill:top-[5px] peer-autofill:translate-y-0 peer-autofill:scale-85 peer-autofill:text-slate-500 peer-autofill:font-semibold peer-autofill:bg-white",
              "peer-[-webkit-autofill]:top-[5px] peer-[-webkit-autofill]:translate-y-0 peer-[-webkit-autofill]:scale-85 peer-[-webkit-autofill]:text-slate-500 peer-[-webkit-autofill]:font-semibold peer-[-webkit-autofill]:bg-white"
            )}
          >
            {label}
          </label>
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1 ml-2.5 text-[10.5px] text-red-500 font-semibold" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
export default InputField;
