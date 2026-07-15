import React, { useState } from 'react';
import { cn } from '../../../lib/cn';
import { Star } from 'lucide-react';

export interface RatingProps {
  value: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onChange?: (val: number) => void;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  maxRating = 5,
  size = 'md',
  readOnly = true,
  onChange,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className={cn("flex items-center space-x-0.5 select-none", className)}>
      {stars.map((star) => {
        const isFilled = star <= Math.floor(displayValue);
        const isHalf = !isFilled && star - 0.5 <= displayValue;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            onClick={() => !readOnly && onChange && onChange(star)}
            className={cn(
              "p-0.5 transition-colors focus:outline-none",
              readOnly ? "cursor-default" : "cursor-pointer active:scale-90"
            )}
            aria-label={`Rate ${star} out of ${maxRating}`}
          >
            <Star
              className={cn(
                "transition-all duration-150",
                sizes[size],
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : isHalf
                    ? "fill-amber-450/40 text-amber-400"
                    : "text-slate-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Rating;
