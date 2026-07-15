import React, { useState } from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { Sidebar } from '../components/navigation/Sidebar';
import { Footer } from '../components/navigation/Footer';
import { ScrollToTop } from '../components/common/ScrollToTop';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-slate-50 overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} showSidebarToggle />

      {/* Main Body */}
      <div className="flex-1 flex items-stretch">
        {/* Sidebar Nav */}
        <Sidebar isOpen={isSidebarOpen} isAdmin={false} />

        {/* Content Pane */}
        <div className="flex-1 flex flex-col justify-between">
          <main className="p-6 md:p-8 flex-grow">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </main>
          
          {/* Sub-Footer */}
          <Footer className="mt-auto border-t-slate-100" />
        </div>
      </div>

      {/* Scroll widget */}
      <ScrollToTop />
    </div>
  );
};

export default DashboardLayout;
