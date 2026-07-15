import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { logout as logoutAction } from '../../../store/authSlice';
import { authService } from '../../../services/auth.service';
import { Dropdown } from '../../ui/Dropdown';
import type { DropdownItem } from '../../ui/Dropdown';
import { Avatar } from '../../ui/Avatar';
import { User, LayoutDashboard, ShoppingBag, Settings, LogOut } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, profile } = useSelector((state: RootState) => state.auth);

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

  const dropdownItems: DropdownItem[] = [
    {
      key: 'profile-info',
      disabled: true,
      className: 'hover:bg-transparent pb-1.5 border-b border-slate-100 flex flex-col items-start',
      label: (
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 tracking-tight">{profile.fullName || 'User Profile'}</span>
          <span className="text-[10px] text-slate-450 font-semibold mt-0.5 truncate w-36">{profile.email}</span>
        </div>
      ),
    },
    {
      key: 'dashboard',
      label: (
        <span className="flex items-center space-x-2 w-full">
          <LayoutDashboard className="w-4 h-4 text-slate-400" />
          <span>Dashboard</span>
        </span>
      ),
      onClick: () => navigate('/dashboard'),
    },
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
      key: 'settings',
      label: (
        <span className="flex items-center space-x-2 w-full">
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </span>
      ),
      onClick: () => navigate('/settings'),
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
          name={profile.fullName}
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
