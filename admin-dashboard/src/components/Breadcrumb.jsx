import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Breadcrumb = ({ activeView = 'dashboard' }) => {
  const navigate = useNavigate();

  const formatViewName = (str) => {
    if (!str) return 'Dashboard';
    const cleaned = str.replace(/-/g, ' ');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const getBreadcrumbs = () => {
    const base = [
      { label: <Home className="w-3.5 h-3.5" />, link: '/admin-dashboard/dashboard' },
      { label: 'Dashboard', link: '/admin-dashboard/dashboard' }
    ];

    if (activeView === 'dashboard' || activeView === '') {
      return [
        { label: <Home className="w-3.5 h-3.5" />, link: '/admin-dashboard/dashboard' },
        { label: 'Dashboard' }
      ];
    }

    return [
      ...base,
      { label: formatViewName(activeView) }
    ];
  };

  const items = getBreadcrumbs();

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium select-none py-1 overflow-x-auto scrollbar-none">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
            {isLast ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => item.link && navigate(item.link)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
