import React, { useState, useRef } from 'react';
import { cn } from '../../../lib/cn';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              "absolute z-[1000] mt-2 w-48 bg-white border border-slate-200/50 shadow-[0_12px_30px_rgba(15,23,42,0.06)] rounded-[14px] overflow-hidden py-1.5 focus:outline-none",
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {items.map((item) => (
              <button
                key={item.key}
                disabled={item.disabled}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer flex items-center",
                  item.className
                )}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
