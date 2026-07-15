import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Laptop, Headphones, Shield, CreditCard, Sparkles
} from 'lucide-react';

interface FloatingItemProps {
  icon: React.ReactNode;
  top: string;
  left: string;
  delay: number;
  duration: number;
  scale: number;
  opacity: number;
}

const FloatingItem: React.FC<FloatingItemProps> = ({ icon, top, left, delay, duration, scale, opacity }) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      style={{ top, left, opacity }}
      initial={{ y: 0, rotate: 0 }}
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 3, -3, 0]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      <div 
        className="p-2 bg-white/70 backdrop-blur-md rounded-xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-105 hover:shadow-md hover:bg-white"
        style={{ transform: `scale(${scale})` }}
      >
        {icon}
      </div>
    </motion.div>
  );
};

export const FloatingObjects: React.FC = () => {
  const objects = [
    { icon: <Laptop className="w-4 h-4 text-blue-600" />, top: '10%', left: '10%', delay: 0, duration: 6, scale: 0.85, opacity: 0.9 },
    { icon: <ShoppingBag className="w-4 h-4 text-cyan-500" />, top: '18%', left: '82%', delay: 1, duration: 5.5, scale: 0.8, opacity: 0.85 },
    { icon: <Headphones className="w-4 h-4 text-sky-500" />, top: '48%', left: '85%', delay: 2, duration: 7, scale: 0.9, opacity: 0.85 },
    { icon: <Shield className="w-4 h-4 text-emerald-500" />, top: '35%', left: '6%', delay: 3, duration: 8, scale: 0.9, opacity: 0.9 },
    { icon: <CreditCard className="w-4 h-4 text-blue-700" />, top: '8%', left: '50%', delay: 2.2, duration: 6.2, scale: 0.85, opacity: 0.9 },
    { icon: <Sparkles className="w-4 h-4 text-amber-500" />, top: '85%', left: '45%', delay: 1.8, duration: 4.8, scale: 0.75, opacity: 0.8 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
      {objects.map((obj, i) => (
        <FloatingItem key={i} {...obj} />
      ))}
    </div>
  );
};
export default FloatingObjects;
