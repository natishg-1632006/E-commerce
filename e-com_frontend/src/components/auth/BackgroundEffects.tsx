import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-50">
      {/* Premium blurred blobs */}
      <div className="absolute -top-[30%] -left-[10%] h-[70%] w-[70%] rounded-full bg-blue-300/10 blur-[100px]" />
      <div className="absolute -bottom-[30%] -right-[10%] h-[70%] w-[70%] rounded-full bg-sky-300/10 blur-[100px]" />

      {/* Grid structure pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#2563EB_1.5px,transparent_1.5px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" 
      />

      {/* Modern floating glass circles */}
      <div className="absolute top-1/4 right-[8%] h-64 w-64 rounded-full border border-white/50 bg-white/5 backdrop-blur-[3px] opacity-60 shadow-xl" />
      <div className="absolute bottom-1/4 left-[8%] h-48 w-48 rounded-full border border-white/40 bg-white/5 backdrop-blur-[2px] opacity-50 shadow-lg" />
    </div>
  );
};
export default BackgroundEffects;
