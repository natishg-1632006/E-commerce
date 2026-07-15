import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface RememberMeProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label?: string;
}

export const RememberMe = forwardRef<HTMLInputElement, RememberMeProps>(
  ({ id, label = 'Remember Me', checked, onChange, ...props }, ref) => {
    return (
      <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer select-none group">
        <div className="relative flex items-center">
          <input
            id={id}
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          {/* Custom Checkbox Frame - Reduced to w-4 h-4 */}
          <div className="w-4 h-4 border border-slate-300 rounded bg-white transition-all duration-200 group-hover:border-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-100 peer-checked:border-blue-600 peer-checked:bg-blue-600 flex items-center justify-center" />
          
          {/* Animated checkmark icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200">
            <motion.svg
              className="w-2.5 h-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              animate={checked ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.15 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </motion.svg>
          </div>
        </div>
        <span className="text-[11.5px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
          {label}
        </span>
      </label>
    );
  }
);

RememberMe.displayName = 'RememberMe';
export default RememberMe;
