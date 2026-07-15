import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { clsx } from 'clsx';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, id, error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="relative w-full mb-2">
        <div className="relative flex items-center h-[42px]">
          <div className="absolute left-3.5 text-slate-500 pointer-events-none">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id={id}
            type={showPassword ? 'text' : 'password'}
            ref={ref}
            placeholder=" "
            className={clsx(
              "w-full h-full pl-[40px] pr-[40px] text-slate-800 bg-white border border-slate-400 rounded-[14px] transition-all duration-300 outline-none peer text-[13px] pt-[15px] pb-[1px]",
              "autofill:shadow-[0_0_0_1000px_white_inset] autofill:text-slate-800",
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
              "left-9",
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
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3.5 p-1 text-slate-500 hover:text-slate-700 focus:outline-none transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
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

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
