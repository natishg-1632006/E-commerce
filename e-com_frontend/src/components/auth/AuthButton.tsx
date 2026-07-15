import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface AuthButtonProps extends HTMLMotionProps<'button'> {
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ isLoading, children, className, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.988 }}
      className={clsx(
        "relative w-full h-[42px] text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-[14px] shadow-[0_4px_16px_rgb(37,99,235,0.15)] hover:shadow-[0_6px_20px_rgb(37,99,235,0.25)] transition-all duration-300 flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-blue-100/50 cursor-pointer",
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <span className="flex items-center space-x-2">
          {children}
        </span>
      )}
    </motion.button>
  );
};
export default AuthButton;
