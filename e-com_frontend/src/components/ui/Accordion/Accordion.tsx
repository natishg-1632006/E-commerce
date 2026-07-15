import React, { useState } from 'react';
import { cn } from '../../../lib/cn';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className,
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    if (allowMultiple) {
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setExpandedIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn("border border-slate-200/60 bg-white rounded-[20px] overflow-hidden divide-y divide-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.01)]", className)}>
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
          <div key={item.id} className="flex flex-col items-stretch">
            {/* Header Button */}
            <button
              onClick={() => handleToggle(item.id)}
              className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-xs lg:text-sm text-slate-800 hover:bg-slate-50/50 transition-colors select-none cursor-pointer"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform duration-250",
                  isExpanded && "transform rotate-180"
                )}
              />
            </button>

            {/* Content Drawer */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden bg-slate-50/20"
                >
                  <div className="px-5 pb-5 pt-1.5 text-xs text-slate-650 leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
