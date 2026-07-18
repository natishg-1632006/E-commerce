import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { logout as logoutAction } from '../../../store/authSlice';
import { authService } from '../../../services/auth.service';
import { Dropdown } from '../../ui/Dropdown';
import type { DropdownItem } from '../../ui/Dropdown';
import { Avatar } from '../../ui/Avatar';
import { User, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, profile, role } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !profile) {
    return (
      <button
        onClick={() => navigate('/auth/login')}
        className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer select-none"
      >
        Sign In
      </button>
    );
  }

  const handleLogout = () => {
    authService.logout();
    dispatch(logoutAction());
    navigate('/auth/login');
  };

  const getFriendlyName = () => {
    if (!profile) return 'User Profile';
    const email = profile.email || '';
    const name = profile.fullName || '';
    const isUuid = /^[0-9a-fA-F-]{8,36}$/.test(name);
    
    let rawName = 'User';
    if (email) {
      rawName = email.split('@')[0];
    } else if (name && !isUuid) {
      rawName = name;
    }
    
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  };

  const dropdownItems: DropdownItem[] = [
    {
      key: 'profile-info',
      disabled: true,
      className: 'hover:bg-transparent pb-1.5 border-b border-slate-100 flex flex-col items-start',
      label: (
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 tracking-tight">{getFriendlyName()}</span>
          <span className="text-[10px] text-slate-450 font-semibold mt-0.5 truncate w-36">{profile.email}</span>
        </div>
      ),
    },
    ...(role === 'admin' ? [
      {
        key: 'admin',
        className: 'border-b border-slate-100 pb-1.5',
        label: (
          <span className="flex items-center space-x-2 w-full">
            <LayoutDashboard className="w-4 h-4 text-blue-500" />
            <span className="text-blue-600 font-bold">Admin Panel</span>
          </span>
        ),
        onClick: () => navigate('/admin'),
      },
    ] : []),
    {
      key: 'orders',
      label: (
        <span className="flex items-center space-x-2 w-full">
          <ShoppingBag className="w-4 h-4 text-slate-400" />
          <span>My Orders</span>
        </span>
      ),
      onClick: () => navigate('/orders'),
    },
    {
      key: 'profile',
      label: (
        <span className="flex items-center space-x-2 w-full">
          <User className="w-4 h-4 text-slate-400" />
          <span>Personal Details</span>
        </span>
      ),
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      className: 'text-red-650 hover:bg-red-50 hover:text-red-700 pt-2 border-t border-slate-100 mt-1',
      label: (
        <span className="flex items-center space-x-2 w-full">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </span>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown
      trigger={
        <Avatar
          name={getFriendlyName()}
          src={profile.profileImage}
          status="online"
          size="sm"
          className="hover:opacity-90 transition-opacity cursor-pointer"
        />
      }
      items={dropdownItems}
      align="right"
    />
  );
};

export default UserMenu;
