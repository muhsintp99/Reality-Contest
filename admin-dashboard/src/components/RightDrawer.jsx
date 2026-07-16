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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in transition-opacity"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0B1222] border-l border-white/10 z-[110] shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#080b12] shrink-0">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto flex flex-col">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
};

export default RightDrawer;
