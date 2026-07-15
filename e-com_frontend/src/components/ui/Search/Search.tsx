import React from 'react';
import { cn } from '../../../lib/cn';
import { Search as SearchIcon, X } from 'lucide-react';

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
}

export const Search: React.FC<SearchProps> = ({
  className,
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  ...props
}) => {
  return (
    <div className={cn("relative w-full h-[42px] flex items-center", className)}>
      <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
        <SearchIcon className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-full pl-[40px] pr-[40px] text-slate-800 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:bg-white rounded-[14px] transition-all duration-200 outline-none text-[13px] font-medium"
        {...props}
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Search;
