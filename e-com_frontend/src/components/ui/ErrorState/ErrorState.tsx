import React from 'react';
import { cn } from '../../../lib/cn';
import { AlertCircle } from 'lucide-react';
import { Button } from '../Button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  retryText?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  className,
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  retryText = 'Try Again',
  onRetry,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-[24px] bg-red-50/10",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-sm lg:text-base font-bold text-slate-800 tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-red-700/80 font-medium leading-relaxed max-w-sm mb-5">
        {description}
      </p>

      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
