import React from 'react';
import logo from '../../assets/auth/logo.svg';

interface AuthHeaderProps {
  title: string;
  subtitle: React.ReactNode;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="w-full mb-3 text-center flex flex-col items-center justify-center">
      {/* Brand logo & title */}
      <div className="flex flex-col items-center justify-center mb-2.5 space-y-1.5">
        <img src={logo} alt="NatCart Logo" className="w-9 h-9" />
        <span className="text-xl font-bold text-slate-900 tracking-tight">
          Nat<span className="text-blue-600">Cart</span>
        </span>
      </div>

      {/* Main headings */}
      <h1 className="text-2xl lg:text-[26px] font-bold text-slate-900 tracking-tight mb-0.5 text-center">
        {title}
      </h1>
      <div className="text-xs lg:text-[13.5px] text-slate-500 font-medium leading-normal max-w-[420px] text-center">
        {subtitle}
      </div>
    </div>
  );
};
export default AuthHeader;
