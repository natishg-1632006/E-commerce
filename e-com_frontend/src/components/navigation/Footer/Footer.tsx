import React from 'react';
import { cn } from '../../../lib/cn';
import { Logo } from '../../common/Logo';

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Footer: React.FC<FooterProps> = ({ className, ...props }) => {
  const sections = [
    {
      title: 'Shop Hardware',
      links: [
        { label: 'Developer Laptops', to: '#' },
        { label: 'High-End Smartphones', to: '#' },
        { label: 'Smart Wearables', to: '#' },
        { label: 'Gaming Accessories', to: '#' },
      ],
    },
    {
      title: 'NatCart Platform',
      links: [
        { label: 'About Us', to: '#' },
        { label: 'Shopping Engine', to: '#' },
        { label: 'Premium Subscriptions', to: '#' },
        { label: 'Press & Media', to: '#' },
      ],
    },
    {
      title: 'Customer Services',
      links: [
        { label: 'Order Tracking', to: '#' },
        { label: 'Return Policy', to: '#' },
        { label: 'Secure Payments', to: '#' },
        { label: 'Contact Support', to: '#' },
      ],
    },
  ];

  return (
    <footer
      className={cn(
        "bg-white border-t border-slate-200/60 w-full py-12 px-4 sm:px-6 lg:px-8 select-none z-10",
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        {/* Brand Description Column */}
        <div className="flex flex-col items-start text-left max-w-sm">
          <Logo size="sm" withLink />
          <p className="text-xs text-slate-450 font-medium leading-relaxed mt-4.5">
            Premium technology marketplace. Experience custom curated developer rigs, smartphones, and modules with guaranteed security.
          </p>
        </div>

        {/* Links Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {sections.map((sec, idx) => (
            <div key={idx} className="flex flex-col items-start text-left">
              <h4 className="text-[11.5px] font-black text-slate-900 tracking-wider uppercase mb-4">
                {sec.title}
              </h4>
              <ul className="space-y-3.5">
                {sec.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.to}
                      className="text-xs font-semibold text-slate-450 hover:text-slate-800 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold text-slate-450 gap-4">
        <span>&copy; {new Date().getFullYear()} NatCart. All rights reserved.</span>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
          <span>&bull;</span>
          <a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a>
          <span>&bull;</span>
          <a href="#" className="hover:text-slate-700 transition-colors">Support Desk</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
