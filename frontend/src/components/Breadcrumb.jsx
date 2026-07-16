import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ activeView }) => {
  const getBreadcrumbs = () => {
    const base = [
      { label: <Home className="w-3.5 h-3.5" />, link: '/' },
      { label: 'Dashboard', link: '/' }
    ];

    switch (activeView) {
      case 'dashboard':
      case 'judge':
      case 'sponsor':
        let consoleLabel = 'Overview';
        if (activeView === 'judge') consoleLabel = 'Judge Console';
        if (activeView === 'sponsor') consoleLabel = 'Sponsor Console';
        return [
          { label: <Home className="w-3.5 h-3.5" />, link: '/' },
          { label: consoleLabel }
        ];
      case 'contests':
        return [
          ...base,
          { label: 'Contests' }
        ];
      case 'rewards':
        return [
          ...base,
          { label: 'Achievements & Badges' }
        ];
      case 'wallet':
        return [
          ...base,
          { label: 'Wallet & Billing' }
        ];
      case 'settings':
        return [
          ...base,
          { label: 'Settings' }
        ];
      case 'profile':
        return [
          ...base,
          { label: 'Settings', link: '/settings' },
          { label: 'Profile' }
        ];
      case 'notifications':
        return [
          ...base,
          { label: 'Notifications' }
        ];
      default:
        return [
          ...base,
          { label: activeView.charAt(0).toUpperCase() + activeView.slice(1) }
        ];
    }
  };

  const items = getBreadcrumbs();

  return (
    <nav className="flex items-center gap-1.5 text-xs text-white/50 font-medium select-none py-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3 h-3 text-white/20" />}
            <span className={`flex items-center gap-1 ${isLast ? 'text-brandPrimary dark:text-cyan-400 font-bold' : 'hover:text-white transition-colors'}`}>
              {item.label}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
