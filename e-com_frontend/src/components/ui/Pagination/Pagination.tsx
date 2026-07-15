import React from 'react';
import { cn } from '../../../lib/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex items-center justify-center space-x-1.5 select-none", className)} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-[38px] h-[38px] flex items-center justify-center border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 rounded-[12px] transition-colors cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "w-[38px] h-[38px] text-xs font-bold rounded-[12px] transition-colors border cursor-pointer",
            currentPage === page
              ? "bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
              : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
          )}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-[38px] h-[38px] flex items-center justify-center border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 rounded-[12px] transition-colors cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
