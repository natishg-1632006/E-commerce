import React from 'react';
import { cn } from '../../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'product' | 'dashboard' | 'glass' | 'simple';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'simple',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-[24px] border transition-all duration-300';

  const variants = {
    simple: 'bg-white border-slate-200/60 shadow-[0_4px_20px_rgba(15,23,42,0.015)]',
    product: 'bg-white border-slate-200/80 hover:border-slate-300/80 hover:shadow-[0_16px_36px_rgba(15,23,42,0.04)]',
    dashboard: 'bg-white border-slate-100 shadow-[0_10px_35px_rgba(15,23,42,0.02)]',
    glass: 'bg-white/70 backdrop-blur-md border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.02)]',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => (
  <div className={cn("px-6 py-5 border-b border-slate-100", className)} {...props}>
    {children}
  </div>
);

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardBody: React.FC<CardBodyProps> = ({ className, children, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => (
  <div className={cn("px-6 py-4.5 border-t border-slate-100 bg-slate-50/30 rounded-b-[24px]", className)} {...props}>
    {children}
  </div>
);

export default Card;
