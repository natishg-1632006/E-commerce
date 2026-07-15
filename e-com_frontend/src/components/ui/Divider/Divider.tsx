import React from 'react';
import { cn } from '../../../lib/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: React.ReactNode;
}

export const Divider: React.FC<DividerProps> = ({
  className,
  orientation = 'horizontal',
  label,
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn("inline-block h-full w-[1px] bg-slate-200 self-stretch", className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div className={cn("relative flex py-3 items-center w-full select-none", className)} {...props}>
        <div className="flex-grow border-t border-slate-200" />
        <span className="flex-shrink mx-4 text-[10.5px] font-bold text-slate-400 tracking-wider uppercase">
          {label}
        </span>
        <div className="flex-grow border-t border-slate-200" />
      </div>
    );
  }

  return (
    <div
      className={cn("w-full border-t border-slate-200 my-4", className)}
      {...props}
    />
  );
};

export default Divider;
