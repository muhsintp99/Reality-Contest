import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-auto px-6 py-4 border-t border-white/5 dark:border-white/5 light:border-black/5 bg-[#0B1120]/40 text-center text-[10px] text-slate-500 dark:text-white/30 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© {new Date().getFullYear()} Haka Platform. All rights reserved.</span>
        <span className="font-mono text-[9px] bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-300 dark:border-white/5">
          Version 1.0.0 (Operator Console Mode)
        </span>
      </div>
    </footer>
  );
};

export default Footer;
