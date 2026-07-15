import React from 'react';
import { cn } from '../../../lib/cn';
import type { LucideIcon } from 'lucide-react';

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  className,
  icon: Icon,
  position = 'bottom-right',
  ...props
}) => {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <button
      className={cn(
        "fixed z-[1100] w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95",
        positions[position],
        className
      )}
      {...props}
    >
      <Icon className="w-5.5 h-5.5" />
    </button>
  );
};

export default FloatingActionButton;
