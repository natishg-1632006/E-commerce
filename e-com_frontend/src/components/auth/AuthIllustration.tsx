import React from 'react';
import { FloatingObjects } from './FloatingObjects';

interface AuthIllustrationProps {
  illustrationSrc: string;
  promoTitle?: string;
  promoDesc?: string;
}

export const AuthIllustration: React.FC<AuthIllustrationProps> = ({
  illustrationSrc,
  promoTitle,
  promoDesc,
}) => {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-0 flex flex-col items-center justify-center p-6 lg:p-8 overflow-hidden bg-gradient-to-tr from-slate-100 via-blue-50/50 to-sky-100/40">
      {/* Background blobs for illustration side */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-400/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none" />

      {/* Floating technology items */}
      <FloatingObjects />

      {/* Central Card with Soft Shadow */}
      <div className="relative z-10 w-full max-w-[170px] sm:max-w-[220px] lg:max-w-[200px] xl:max-w-[220px] aspect-square flex items-center justify-center mb-2">
        {/* Glow halo behind character */}
        <div className="absolute w-[85%] h-[85%] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl opacity-80" />
        
        {/* Central PNG Illustration */}
        <img
          src={illustrationSrc}
          alt="NatCart Premium Experience"
          className="relative z-10 w-[90%] h-[90%] object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.18)] animate-float-medium"
        />
      </div>

      {/* Promotional Messaging */}
      {promoTitle && (
        <div className="relative z-10 text-center max-w-[360px] mt-1 px-4">
          <h3 className="text-md lg:text-[22px] lg:leading-6 font-extrabold text-slate-800 mb-0.5 tracking-tight">
            {promoTitle}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium leading-normal">
            {promoDesc}
          </p>
        </div>
      )}
    </div>
  );
};
export default AuthIllustration;
