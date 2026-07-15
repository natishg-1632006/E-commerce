import React from 'react';
import { cn } from '../../../lib/cn';
import { motion } from 'framer-motion';

export interface TabItem {
  key: string;
  label: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  onChange,
  className,
}) => {
  return (
    <div className={cn("border-b border-slate-200 flex items-center space-x-6 relative select-none", className)}>
      {items.map((item) => {
        const isActive = activeKey === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={cn(
              "pb-3.5 text-xs font-bold transition-colors cursor-pointer relative",
              isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {item.label}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
