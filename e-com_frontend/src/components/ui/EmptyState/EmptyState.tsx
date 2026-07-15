import React from 'react';
import { cn } from '../../../lib/cn';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../Button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  className,
  icon: Icon,
  title,
  description,
  actionText,
  onActionClick,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-300 rounded-[24px] bg-slate-50/35",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-sm lg:text-base font-bold text-slate-800 tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mb-5">
        {description}
      </p>

      {actionText && onActionClick && (
        <Button variant="outline" size="sm" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
