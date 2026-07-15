import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import logoImg from '../../../assets/auth/logo.svg'; // Reuse existing logo asset if available, fallback otherwise

export interface LogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: 'sm' | 'md' | 'lg';
  withLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  withLink = true,
  ...props
}) => {
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-black',
  };

  const content = (
    <div className="flex items-center space-x-2.5 select-none">
      <img src={logoImg} alt="NatCart Logo" className={cn(sizes[size])} />
      <span className={cn("text-slate-900 tracking-tight", textSizes[size])}>
        Nat<span className="text-blue-600">Cart</span>
      </span>
    </div>
  );

  if (withLink) {
    return (
      <Link
        to="/"
        className={cn("inline-flex items-center transition-opacity hover:opacity-90", className)}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("inline-flex items-center", className)}>
      {content}
    </div>
  );
};

export default Logo;
