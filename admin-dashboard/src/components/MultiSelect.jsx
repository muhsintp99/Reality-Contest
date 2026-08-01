import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search, Tag, Folder, Sparkles, Layers, Globe, Gamepad2, BookOpen, Palette } from 'lucide-react';

const CATEGORY_ICON_MAP = {
  Knowledge: BookOpen,
  Arts: Palette,
  Gaming: Gamepad2,
  Technology: Globe,
  Default: Tag
};

const getCategoryIcon = (opt) => {
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

export const MultiSelect = ({
  options = [],
  value,
  selected,
  onChange,
  placeholder = 'Search & Select Categories...'
}) => {
  // Support both 'selected' and 'value' prop keys
  const activeValue = selected !== undefined ? selected : (value || []);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = (val) => {
    if (activeValue.includes(val)) {
      onChange(activeValue.filter(v => v !== val));
    } else {
      onChange([...activeValue, val]);
    }
  };

  const handleSelectAll = () => {
    const allVals = options.map(o => o.value);
    onChange(allVals);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full text-left" ref={wrapperRef}>
      {/* Selected Items / Trigger Area */}
      <div 
        className="min-h-[42px] w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 flex flex-wrap gap-1.5 items-center cursor-pointer transition-all focus-within:border-brandPrimary"
        onClick={() => setIsOpen(!isOpen)}
      >
        {activeValue.length === 0 && (
          <span className="text-slate-400 dark:text-white/40 text-xs px-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            {placeholder}
          </span>
        )}
        
        {activeValue.map(val => {
          const opt = options.find(o => o.value === val) || { value: val, label: val };
          return (
            <span 
              key={val} 
              className="bg-brandPrimary/15 text-brandPrimary dark:text-brandPrimary border border-brandPrimary/20 text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold shadow-xs"
            >
              {getCategoryIcon(opt)}
              <span>{opt.label}</span>
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors ml-0.5" 
                onClick={(e) => { e.stopPropagation(); handleToggle(val); }} 
              />
            </span>
          );
        })}

        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-white/50 ml-auto cursor-pointer transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu with Integrated Search */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden text-xs space-y-1 p-2 animate-fade-in">
          {/* Search Input Field */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input 
              ref={searchInputRef}
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brandPrimary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
            />
          </div>

          {/* Quick Actions Bar */}
          <div className="flex justify-between items-center px-2 py-1 text-[10px] border-b border-slate-100 dark:border-white/5 pb-2 mb-1">
            <span className="text-slate-400 font-bold uppercase">
              {filteredOptions.length} Categories Found
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-brandPrimary hover:underline font-bold"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-rose-500 hover:underline font-bold"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Category List Items */}
          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-4 text-xs text-slate-400 text-center font-medium">No matching categories found.</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = activeValue.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleToggle(opt.value)}
                    className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'bg-brandPrimary/10 text-brandPrimary font-bold border border-brandPrimary/20' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(opt)}
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brandPrimary" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
