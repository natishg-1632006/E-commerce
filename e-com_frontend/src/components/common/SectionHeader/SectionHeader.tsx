import React from 'react';
import { cn } from '../../../lib/cn';

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  className,
  title,
  subtitle,
  action,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4.5 border-b border-slate-100 mb-6 select-none",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-start text-left">
        <h2 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-450 font-medium leading-relaxed mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center flex-shrink-0 self-start sm:self-center">
          {action}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
