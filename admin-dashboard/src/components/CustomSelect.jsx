import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

export const CustomSelect = ({ value, onChange, options, className = "", position = "bottom" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0] || { value: '', label: '' };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-50 dark:bg-darkCard border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none text-left transition-all hover:border-brandPrimary/40"
      >
        <span className="font-semibold">{selectedOption.label}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 dark:text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-50 left-0 right-0 ${position === 'top' ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'} bg-white dark:bg-darkCard border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 max-h-60 overflow-y-auto animate-scale-in text-left`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                option.value === value
                  ? 'bg-brandPrimary text-white shadow-sm shadow-brandPrimary/10'
                  : 'text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && <Check className="w-3 h-3 text-white" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
