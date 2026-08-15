import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Check, Search, Tag, BookOpen, Palette, Gamepad2, Globe, Layers, Folder } from 'lucide-react';

const CATEGORY_ICON_MAP = {
  Knowledge: BookOpen,
  Arts: Palette,
  Gaming: Gamepad2,
  Technology: Globe,
  Default: Tag
};

const getOptionIcon = (opt) => {
  if (opt.icon) {
    if (typeof opt.icon === 'string') {
      const Matched = CATEGORY_ICON_MAP[opt.icon] || CATEGORY_ICON_MAP[opt.label] || Tag;
      return <Matched className="w-3.5 h-3.5 text-brandPrimary shrink-0" />;
    }
    const IconComp = opt.icon;
    return <IconComp className="w-3.5 h-3.5 text-brandPrimary shrink-0" />;
  }
  const Matched = CATEGORY_ICON_MAP[opt.label] || Tag;
  return <Matched className="w-3.5 h-3.5 text-brandPrimary shrink-0" />;
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
  className = ''
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
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasCustomWidth = className && /(?:^|\s)(?:w-|max-w-|min-w-)/.test(className);
  const widthClass = hasCustomWidth ? '' : 'w-full sm:w-48';

  return (
    <div className={`relative block ${widthClass} text-left ${isOpen ? 'z-[999]' : 'z-10'} ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white dark:bg-[#0f172a] border ${
          isOpen
            ? 'border-brandPrimary dark:border-brandSecondary ring-2 ring-brandPrimary/20'
            : 'border-slate-200 dark:border-white/15 hover:border-brandPrimary/60 dark:hover:border-brandSecondary/60'
        } rounded-xl text-xs font-bold text-slate-800 dark:text-white shadow-sm transition-all duration-150 cursor-pointer focus:outline-none`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {searchable ? getOptionIcon(selectedOption) : <Icon className="w-3.5 h-3.5 text-brandPrimary dark:text-brandSecondary shrink-0" />}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-white/60 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brandPrimary dark:text-brandSecondary' : 'rotate-0'}`} />
      </button>

      {isOpen && (
        <div className={`absolute ${isUp ? 'bottom-full mb-1.5' : 'mt-1.5'} ${align === 'right' ? 'right-0' : 'left-0'} min-w-full w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-brandPrimary/30 rounded-xl shadow-2xl z-[999] overflow-hidden py-1.5 animate-fade-in backdrop-blur-md text-xs space-y-1`}>
          {/* Search Input Bar */}
          {searchable && (
            <div className="relative px-2 pb-1.5 border-b border-slate-100 dark:border-white/10">
              <Search className="absolute left-4 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search category..."
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brandPrimary"
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 px-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-400 text-center font-medium">No results found.</div>
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
                        ? 'bg-brandPrimary/10 dark:bg-brandPrimary/20 text-brandPrimary dark:text-emerald-400 font-extrabold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {searchable && getOptionIcon(option)}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brandPrimary dark:text-emerald-400 shrink-0 stroke-[2.5]" />}
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
