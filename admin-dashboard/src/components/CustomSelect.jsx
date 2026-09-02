import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Check, Search, X, Tag, BookOpen, Palette, Gamepad2, Globe, Layers, Folder } from 'lucide-react';

const CATEGORY_ICON_MAP = {
  Knowledge: BookOpen,
  Arts: Palette,
  Gaming: Gamepad2,
  Technology: Globe,
  Default: Tag
};

const getOptionIcon = (opt) => {
  if (opt?.icon) {
    if (typeof opt.icon === 'string') {
      const Matched = CATEGORY_ICON_MAP[opt.icon] || CATEGORY_ICON_MAP[opt.label] || Tag;
      return <Matched className="w-3.5 h-3.5 text-brandPrimary dark:text-emerald-400 shrink-0" />;
    }
    const IconComp = opt.icon;
    return <IconComp className="w-3.5 h-3.5 text-brandPrimary dark:text-emerald-400 shrink-0" />;
  }
  const Matched = CATEGORY_ICON_MAP[opt?.label] || Tag;
  return <Matched className="w-3.5 h-3.5 text-brandPrimary dark:text-emerald-400 shrink-0" />;
};

export const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select Option',
  icon: Icon = Filter,
  searchable = false,
  align = 'left',
  direction = 'down', // 'down' | 'up'
  position, // 'top' | 'bottom'
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const isUp = direction === 'up' || position === 'top';

  const selectedOption = options.find(opt => opt.value === value) || { label: value || placeholder, value };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = options.filter(opt =>
    (opt.label || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasCustomWidth = className && /(?:^|\s)(?:w-|max-w-|min-w-)/.test(className);
  const widthClass = hasCustomWidth ? '' : 'w-full';

  return (
    <div className={`relative block ${widthClass} text-left ${isOpen ? 'z-[999]' : 'z-10'} ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-900/90 dark:bg-[#0f172a]/95 backdrop-blur-md border ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-slate-800'
            : isOpen
            ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5'
            : 'border-slate-800 hover:border-emerald-500/50'
        } rounded-xl text-xs font-semibold text-white transition-all duration-200 cursor-pointer focus:outline-none`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {searchable ? getOptionIcon(selectedOption) : <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : 'rotate-0'}`} />
      </button>

      {isOpen && !disabled && (
        <div className={`absolute ${isUp ? 'bottom-full mb-1.5' : 'mt-1.5'} ${align === 'right' ? 'right-0' : 'left-0'} min-w-full w-full bg-slate-900/95 dark:bg-[#0f172a]/95 border border-slate-800 rounded-xl shadow-2xl z-[999] overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl text-xs space-y-1`}>
          {/* Search Input Bar */}
          {searchable && (
            <div className="relative px-2 pb-1.5 border-b border-slate-800/80">
              <Search className="absolute left-4 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 px-1 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-400 text-center font-medium">No matching options found.</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg transition-all duration-150 cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-400 font-extrabold border border-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {searchable && getOptionIcon(option)}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
