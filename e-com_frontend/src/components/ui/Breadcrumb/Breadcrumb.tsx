import React from 'react';
import { cn } from '../../../lib/cn';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  className,
  items,
  ...props
}) => {
  return (
    <nav className={cn("flex select-none", className)} aria-label="Breadcrumb" {...props}>
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 md:mx-1.5 flex-shrink-0" />
              )}
              {isLast || !item.to ? (
                <span className="text-[11.5px] font-bold text-slate-700 truncate max-w-[150px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="text-[11.5px] font-semibold text-slate-450 hover:text-slate-750 transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
