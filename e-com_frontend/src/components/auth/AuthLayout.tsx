import React from 'react';
import { motion } from 'framer-motion';
import { BackgroundEffects } from './BackgroundEffects';
import { AuthIllustration } from './AuthIllustration';

interface AuthLayoutProps {
  children: React.ReactNode;
  illustrationSrc: string;
  promoTitle?: string;
  promoDesc?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  illustrationSrc,
  promoTitle,
  promoDesc,
}) => {
  return (
    <div className="relative min-h-screen lg:h-screen w-screen flex items-stretch justify-stretch lg:overflow-hidden">
      {/* Premium design system background canvas */}
      <BackgroundEffects />

      {/* Main content split-screen layout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full h-full flex flex-col-reverse lg:flex-row bg-white overflow-hidden"
      >
        {/* Left Side: Form Section (45%) */}
        <div className="w-full lg:w-[45%] min-h-screen lg:min-h-0 lg:h-full px-6 py-8 lg:px-12 lg:py-8 flex flex-col justify-between bg-white z-10">
          <div className="max-w-[460px] w-full mx-auto flex-1 flex flex-col justify-between">
            {children}
          </div>
        </div>

        {/* Right Side: Visual Section (55%) */}
        <div className="hidden lg:block w-full lg:w-[55%] min-h-[360px] lg:min-h-0 lg:h-full">
          <AuthIllustration
            illustrationSrc={illustrationSrc}
            promoTitle={promoTitle}
            promoDesc={promoDesc}
          />
        </div>
      </motion.div>
    </div>
  );
};
export default AuthLayout;
