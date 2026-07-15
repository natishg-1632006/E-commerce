import React from 'react';
import { cn } from '../../../lib/cn';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  className,
  size = 'md',
  fullScreen = false,
  ...props
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <Loader2
      className={cn("animate-spin text-blue-600", sizes[size], className)}
    />
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-[1800] flex items-center justify-center bg-white/80 backdrop-blur-sm"
        {...props}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center" {...props}>
      {spinner}
    </div>
  );
};

export default Spinner;
