import React from 'react';

export const AuthFooter: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center space-x-3.5 text-[11px] text-slate-400 font-semibold mt-3 pt-3 border-t border-slate-100/60">
      <a href="#privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
      <span className="text-slate-300 select-none">•</span>
      <a href="#terms" className="hover:text-slate-600 transition-colors">Terms of Service</a>
      <span className="text-slate-300 select-none">•</span>
      <a href="#support" className="hover:text-slate-600 transition-colors">Support</a>
    </div>
  );
};
export default AuthFooter;
