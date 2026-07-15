import React from 'react';
import { cn } from '../../../lib/cn';
import { X } from 'lucide-react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  onDelete?: () => void;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  className,
  label,
  onDelete,
  disabled = false,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-[11px] font-bold select-none transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span>{label}</span>
      {onDelete && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
          className={cn(
            "ml-1.5 p-0.5 rounded-full hover:bg-slate-200 hover:text-slate-900 transition-colors text-slate-450 focus:outline-none cursor-pointer",
            disabled && "cursor-not-allowed hover:bg-transparent"
          )}
          aria-label={`Remove ${label}`}
        >
          <X className="w-2.5 h-2.5 stroke-[3px]" />
        </button>
      )}
    </span>
  );
};

export default Chip;
