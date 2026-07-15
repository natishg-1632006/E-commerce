import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import { LayoutDashboard, ShoppingBag, Settings, User, ShieldAlert, CreditCard } from 'lucide-react';

export interface SidebarProps {
  isOpen: boolean;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isAdmin = false }) => {
  const buyerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/billing', label: 'Billing & Cards', icon: CreditCard },
    { to: '/profile', label: 'Personal Details', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Panel', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products Master', icon: ShoppingBag },
    { to: '/admin/orders', label: 'System Orders', icon: CreditCard },
    { to: '/admin/alerts', label: 'Security Log', icon: ShieldAlert },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : buyerLinks;

  return (
    <aside
      className={cn(
        "fixed md:sticky top-[64px] h-[calc(100vh-64px)] bg-white border-r border-slate-200/60 z-[1000] transition-all duration-300 w-64 select-none",
        !isOpen && "-translate-x-full md:translate-x-0 md:w-20"
      )}
    >
      <nav className="p-4 flex flex-col space-y-1.5 h-full">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.15)]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                )
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={cn(
                  "transition-opacity duration-300 whitespace-nowrap",
                  !isOpen && "opacity-0 md:hidden"
                )}
              >
                {link.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
