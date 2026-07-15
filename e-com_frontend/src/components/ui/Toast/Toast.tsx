import React from 'react';
import { cn } from '../../../lib/cn';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  className,
}) => {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
  };

  const backgrounds = {
    success: 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.03)]',
    error: 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(239,68,68,0.03)]',
    warning: 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(245,158,11,0.03)]',
    info: 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(37,99,235,0.03)]',
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-3.5 border rounded-[16px] px-4 py-3 max-w-sm w-full select-none z-[1700]",
        backgrounds[type],
        className
      )}
    >
      <div className="flex-shrink-0 flex items-center justify-center">
        {icons[type]}
      </div>
      <div className="flex-grow text-xs font-semibold text-slate-700 leading-normal">
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Toast;
