import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const RightDrawer = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] animate-fade-in transition-opacity"
          onClick={onClose}
        />
      )}
      {/* Drawer Container */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#F6FCF0] dark:bg-[#0B1222] border-l border-[#C4E2A8]/80 dark:border-white/10 text-slate-800 dark:text-white z-[110] shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="p-5 border-b border-[#C4E2A8]/80 dark:border-white/10 flex justify-between items-center bg-[#E2F1D5]/90 dark:bg-[#080b12] shrink-0 transition-colors duration-300">
          <h2 className="text-sm font-extrabold font-poppins text-slate-900 dark:text-white uppercase tracking-wider">{title}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-[#C4E2A8]/80 dark:border-white/10 rounded-xl transition-colors text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto flex flex-col bg-[#F6FCF0]/90 dark:bg-[#0B1222] text-slate-800 dark:text-white">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
};

export default RightDrawer;
