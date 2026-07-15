import React from 'react';
import { cn } from '../../../lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide select-none';

  const variants = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-150',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-150',
    warning: 'bg-amber-50 text-amber-700 border border-amber-150',
    danger: 'bg-red-50 text-red-700 border border-red-150',
    info: 'bg-cyan-50 text-cyan-700 border border-cyan-150',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] rounded-[6px] h-4.5',
    md: 'px-2.5 py-0.5 text-[11px] rounded-[8px] h-5.5',
    lg: 'px-3.5 py-1 text-xs rounded-[10px] h-7',
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
