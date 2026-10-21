import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePageTitle } from '../context/PageTitleContext';
import { isIdLike, humanizeSlug, ROUTE_LABEL_MAP } from '../utils/routeUtils';

export const Breadcrumb = ({ activeView = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customTitle, breadcrumbsOverride } = usePageTitle();

  const getBreadcrumbs = () => {
    // If a custom breadcrumb structure is explicitly provided by the active view
    if (Array.isArray(breadcrumbsOverride) && breadcrumbsOverride.length > 0) {
      return breadcrumbsOverride;
    }

    const base = [
      { label: <Home className="w-3.5 h-3.5" />, link: '/admin-dashboard/dashboard' },
      { label: 'Dashboard', link: '/admin-dashboard/dashboard' }
    ];

    // Determine segments from location.pathname or activeView
    let cleanPath = location.pathname.replace(/^\/admin-dashboard\/?/, '');
    if (!cleanPath && activeView) {
      cleanPath = String(activeView).replace(/^\/admin-dashboard\/?/, '');
    }

    if (!cleanPath || cleanPath === 'dashboard') {
      return [
        { label: <Home className="w-3.5 h-3.5" />, link: '/admin-dashboard/dashboard' },
        { label: 'Dashboard' }
      ];
    }

    // Split segments and filter empty parts
    const segments = cleanPath.split('/').filter(Boolean);
    const crumbs = [...base];
    let accumulatedPath = '/admin-dashboard';

    segments.forEach((seg, index) => {
      accumulatedPath += `/${seg}`;
      const isLast = index === segments.length - 1;

      // Handle ID or title-slug segments
      if (isIdLike(seg)) {
        crumbs.push({
          label: isLast && customTitle ? customTitle : (customTitle || 'Details'),
          link: isLast ? null : accumulatedPath
        });
      } else if (isLast && customTitle) {
        // Last segment has an explicit entity title provided by the view
        crumbs.push({
          label: customTitle,
          link: null
        });
      } else {
        const mappedLabel = ROUTE_LABEL_MAP[seg.toLowerCase()] || humanizeSlug(seg);
        crumbs.push({
          label: mappedLabel,
          link: isLast ? null : accumulatedPath
        });
      }
    });

    return crumbs;
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
              <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg truncate max-w-xs sm:max-w-md">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => item.link && navigate(item.link)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer truncate max-w-[150px]"
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
