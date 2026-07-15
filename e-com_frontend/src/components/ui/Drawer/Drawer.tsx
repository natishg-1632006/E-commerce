import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../../lib/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  size = 'md',
  children,
  closeOnBackdropClick = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const placementStyles = {
    left: 'left-0 top-0 bottom-0 h-full border-r',
    right: 'right-0 top-0 bottom-0 h-full border-l',
    top: 'top-0 left-0 right-0 w-full border-b',
    bottom: 'bottom-0 left-0 right-0 w-full border-t rounded-t-[26px]',
  };

  const horizontalSizes = {
    sm: 'max-w-[280px]',
    md: 'max-w-xs',
    lg: 'max-w-md',
    xl: 'max-w-xl',
  };

  const verticalSizes = {
    sm: 'max-h-[200px]',
    md: 'max-h-[360px]',
    lg: 'max-h-[500px]',
    xl: 'max-h-[70vh]',
  };

  const widthStyle = (position === 'left' || position === 'right') ? horizontalSizes[size] : 'w-full';
  const heightStyle = (position === 'top' || position === 'bottom') ? verticalSizes[size] : 'h-full';

  const animations = {
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    top: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
    bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1600] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Drawer Body */}
          <motion.div
            initial={animations[position].initial}
            animate={animations[position].animate}
            exit={animations[position].exit}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              "fixed bg-white border-slate-200/50 shadow-[0_24px_50px_rgba(15,23,42,0.08)] z-10 flex flex-col items-stretch",
              placementStyles[position],
              widthStyle,
              heightStyle
            )}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all rounded-[10px] cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 text-body-sm text-slate-600">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
