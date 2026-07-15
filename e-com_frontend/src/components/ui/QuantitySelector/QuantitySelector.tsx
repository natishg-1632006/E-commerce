import React from 'react';
import { cn } from '../../../lib/cn';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  className,
}) => {
  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onChange(value - 1);
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange(value + 1);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center border border-slate-300 rounded-[12px] bg-white h-[38px] p-0.5 overflow-hidden select-none",
        disabled && "opacity-50 cursor-not-allowed bg-slate-50",
        className
      )}
    >
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-[10px] transition-colors cursor-pointer"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="w-9 text-center text-xs font-bold text-slate-800">
        {value}
      </span>

      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-[10px] transition-colors cursor-pointer"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default QuantitySelector;
