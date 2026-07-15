import React from 'react';
import { cn } from '../../../lib/cn';

export interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  currency?: string;
  showDecimals?: boolean;
}

export const Price: React.FC<PriceProps> = ({
  className,
  value,
  currency = 'INR',
  showDecimals = false,
  ...props
}) => {
  const formatPrice = (priceVal: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(priceVal);
  };

  return (
    <span
      className={cn("font-bold text-slate-900 tracking-tight", className)}
      {...props}
    >
      {formatPrice(value)}
    </span>
  );
};

export default Price;
