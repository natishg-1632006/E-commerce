import React, { useState, useRef } from 'react';
import { Logo } from '../../common/Logo';
import { Search } from '../../ui/Search';
import { ShoppingCart, Menu, X, Heart, Smartphone, Headphones, Watch, Gamepad2, Tv, Speaker, ChevronDown } from 'lucide-react';
import { UserMenu } from '../UserMenu';
import { NotificationMenu } from '../NotificationMenu';
import { MobileMenu } from '../MobileMenu';
import { Link } from 'react-router-dom';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import guideImg from '../../../assets/products/guide.jpg';

export interface NavbarProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  showSidebarToggle = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegamenuOpen, setIsMegamenuOpen] = useState(false);
  const megamenuRef = useRef<HTMLDivElement | null>(null);

  const { items } = useSelector((state: RootState) => state.cart);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useClickOutside(megamenuRef, () => setIsMegamenuOpen(false));

  return (
    <div className="sticky top-0 w-full flex flex-col items-stretch z-[1100]">
      <header className="w-full h-[64px] bg-white/85 backdrop-blur-md border-b border-slate-200/60 select-none">
        <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 relative">
          {/* Left Side: Logo / Menu Toggle */}
          <div className="flex items-center space-x-5">
            {showSidebarToggle && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-xl cursor-pointer mr-1 hidden md:block"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Logo size="sm" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-5.5 text-xs font-bold text-slate-650 mt-0.5">
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <button
                onClick={() => setIsMegamenuOpen(!isMegamenuOpen)}
                className="hover:text-blue-600 transition-colors flex items-center space-x-1 cursor-pointer focus:outline-none"
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${isMegamenuOpen ? 'transform rotate-180' : ''}`} />
              </button>
              <Link to="#" className="hover:text-blue-600 transition-colors">Brands</Link>
              <Link to="#" className="hover:text-blue-600 transition-colors">Deals</Link>
              <Link to="#" className="hover:text-blue-600 transition-colors">New Arrivals</Link>
              <Link to="#" className="hover:text-blue-600 transition-colors">Support</Link>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:block flex-1 max-w-[340px] lg:max-w-[400px] mx-auto">
            <Search value={searchQuery} onChange={setSearchQuery} placeholder="Search for products, brands..." />
          </div>

          {/* Right Side: Navigation Actions */}
          <div className="flex items-center space-x-3.5">
            {/* Favorites Icon */}
            <button
              className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-xl relative hover:bg-slate-50 cursor-pointer flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* Cart Widget */}
            <Link
              to="/cart"
              className="p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-xl relative hover:bg-slate-50 cursor-pointer flex items-center justify-center border-none bg-transparent"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9.5px] font-black">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Notifications Dropdown */}
            <NotificationMenu />

            {/* User Profile Dropdown */}
            <UserMenu />

            {/* Mobile Navigation Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors rounded-xl lg:hidden cursor-pointer flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Categories Megamenu Dropdown */}
          {isMegamenuOpen && (
            <div
              ref={megamRef => { megamenuRef.current = megamRef; }}
              className="absolute top-[64px] left-4 lg:left-32 w-[calc(100vw-32px)] max-w-lg bg-white border border-slate-200/50 shadow-[0_24px_50px_rgba(15,23,42,0.06)] rounded-[24px] p-6 grid grid-cols-3 gap-6 z-[1200] overflow-hidden"
            >
              {/* Column 1: Mobile & Audio */}
              <div className="flex flex-col items-start text-left space-y-3.5">
                <h4 className="text-[11px] font-black text-slate-900 tracking-wider uppercase">Mobile & Audio</h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="#" className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 text-xs font-semibold" onClick={() => setIsMegamenuOpen(false)}>
                      <Smartphone className="w-4 h-4 text-slate-400" />
                      <span>Smartphones</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 text-xs font-semibold" onClick={() => setIsMegamenuOpen(false)}>
                      <Headphones className="w-4 h-4 text-slate-400" />
                      <span>Headphones</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 text-xs font-semibold" onClick={() => setIsMegamenuOpen(false)}>
                      <Watch className="w-4 h-4 text-slate-400" />
                      <span>Wearables</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Entertainment */}
              <div className="flex flex-col items-start text-left space-y-3.5">
                <h4 className="text-[11px] font-black text-slate-900 tracking-wider uppercase">Entertainment</h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="#" className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 text-xs font-semibold" onClick={() => setIsMegamenuOpen(false)}>
                      <Gamepad2 className="w-4 h-4 text-slate-400" />
                      <span>Gaming</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 text-xs font-semibold" onClick={() => setIsMegamenuOpen(false)}>
                      <Tv className="w-4 h-4 text-slate-400" />
                      <span>Smart TVs</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 text-xs font-semibold" onClick={() => setIsMegamenuOpen(false)}>
                      <Speaker className="w-4 h-4 text-slate-400" />
                      <span>Home Audio</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Guide Banner */}
              <div className="flex flex-col items-start text-left bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50 space-y-2">
                <span className="text-[9.5px] font-black text-blue-700 tracking-wide uppercase">Seasonal Tech Guide</span>
                <img src={guideImg} alt="Tech Guide illustration" className="w-full h-20 object-cover rounded-xl border border-blue-100" />
                <Link to="#" className="text-[10px] font-black text-blue-600 hover:text-blue-750 flex items-center space-x-1" onClick={() => setIsMegamenuOpen(false)}>
                  <span>View Guide</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  );
};

export default Navbar;
