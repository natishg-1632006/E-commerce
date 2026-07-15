import React from 'react';
import { cn } from '../../../lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle' | 'product' | 'card' | 'table';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  ...props
}) => {
  const baseStyles = 'bg-slate-200 animate-pulse rounded';

  if (variant === 'product') {
    return (
      <div className={cn("rounded-[24px] border border-slate-200/60 p-4 bg-white flex flex-col items-stretch space-y-4", className)}>
        <div className="w-full aspect-square rounded-[18px] bg-slate-200 animate-pulse" />
        <div className="h-4.5 w-3/4 bg-slate-200 animate-pulse rounded-[6px]" />
        <div className="h-4 w-1/2 bg-slate-200 animate-pulse rounded-[5px]" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 bg-slate-200 animate-pulse rounded-[8px]" />
          <div className="h-9 w-20 bg-slate-200 animate-pulse rounded-[12px]" />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("rounded-[24px] border border-slate-200/60 p-6 bg-white flex flex-col items-stretch space-y-3.5", className)}>
        <div className="h-5 w-1/3 bg-slate-200 animate-pulse rounded-[7px]" />
        <div className="h-3.5 w-full bg-slate-200 animate-pulse rounded-[5px]" />
        <div className="h-3.5 w-5/6 bg-slate-200 animate-pulse rounded-[5px]" />
        <div className="h-3.5 w-2/3 bg-slate-200 animate-pulse rounded-[5px]" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn("w-full flex flex-col items-stretch space-y-3", className)}>
        <div className="h-9 w-full bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-12 w-full bg-slate-250 animate-pulse rounded-xl" />
        <div className="h-12 w-full bg-slate-250 animate-pulse rounded-xl" />
        <div className="h-12 w-full bg-slate-250 animate-pulse rounded-xl" />
      </div>
    );
  }

  const variants = {
    text: 'h-3.5 w-full rounded-[6px]',
    rect: 'w-full h-24 rounded-xl',
    circle: 'rounded-full aspect-square',
    product: '',
    card: '',
    table: '',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
};

export default Skeleton;
