import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { ScrollToTop } from '../components/common/ScrollToTop';
import { PageContainer } from '../components/common/PageContainer';
import { BackgroundEffects } from '../components/auth/BackgroundEffects';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-screen flex flex-col justify-between bg-slate-50 overflow-x-clip">
      {/* Decorative Canvas Background */}
      <BackgroundEffects />

      {/* Header Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-stretch justify-start py-8 z-10">
        <PageContainer>
          {children}
        </PageContainer>
      </main>

      {/* Footer bar */}
      <Footer />

      {/* Scroll to Top Trigger */}
      <ScrollToTop />
    </div>
  );
};

export default MainLayout;
