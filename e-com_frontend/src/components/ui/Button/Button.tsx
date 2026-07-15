import React, { forwardRef } from 'react';
import { cn } from '../../../lib/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer active:scale-95';

    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent focus:ring-blue-100/50',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-850 border border-transparent focus:ring-slate-100',
      outline: 'bg-transparent hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-slate-100',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 border border-transparent focus:ring-slate-100',
      danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-100/50',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent focus:ring-emerald-100/50',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs rounded-[10px]',
      md: 'h-[42px] px-5 text-sm rounded-[14px]',
      lg: 'h-12 px-6 text-sm rounded-[16px]',
      xl: 'h-14 px-8 text-base rounded-[18px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2.5 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
