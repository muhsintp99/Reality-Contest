import React from 'react';

export const Badge = ({ 
  children, 
  variant = 'neutral', 
  className = '', 
  ...props 
}) => {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors';
  
  const variants = {
    primary: 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400',
    secondary: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    accent: 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400',
    neutral: 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/5 dark:text-white/55',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    danger: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
    info: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
  };

  return (
    <span 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
