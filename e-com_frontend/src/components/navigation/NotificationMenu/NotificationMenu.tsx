import React from 'react';
import { Dropdown } from '../../ui/Dropdown';
import type { DropdownItem } from '../../ui/Dropdown';
import { Bell } from 'lucide-react';

export const NotificationMenu: React.FC = () => {
  const notifications = [
    { id: '1', title: 'System Security Configured', message: 'AWS Cognito keys loaded from .env setup.' },
    { id: '2', title: 'Developer setup is ready', message: 'Build check verified Phase 2 structures.' },
    { id: '3', title: 'NatCart Welcome Gift', message: 'Enjoy premium checkout benefits.' },
  ];

  const dropdownItems: DropdownItem[] = [
    {
      key: 'header',
      disabled: true,
      className: 'hover:bg-transparent pb-1.5 border-b border-slate-100 font-black text-slate-800 text-[10px] tracking-wider uppercase',
      label: 'Notifications',
    },
    ...notifications.map((notif) => ({
      key: notif.id,
      className: 'hover:bg-slate-50/50 py-3.5 border-b border-slate-100/50 flex flex-col items-start text-left gap-1 last:border-b-0',
      label: (
        <div className="flex flex-col items-start text-left">
          <span className="text-[11px] font-bold text-slate-800 tracking-tight leading-none">{notif.title}</span>
          <span className="text-[10px] text-slate-450 font-medium leading-normal mt-1 w-38 truncate">{notif.message}</span>
        </div>
      ),
    })),
  ];

  return (
    <Dropdown
      trigger={
        <button
          className="p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-xl relative hover:bg-slate-50 cursor-pointer flex items-center justify-center"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-650 rounded-full" />
        </button>
      }
      items={dropdownItems}
      align="right"
      className="w-56"
    />
  );
};

export default NotificationMenu;
