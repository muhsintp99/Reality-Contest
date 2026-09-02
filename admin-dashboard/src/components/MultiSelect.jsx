import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search, Tag, Globe, Gamepad2, BookOpen, Palette } from 'lucide-react';

const CATEGORY_ICON_MAP = {
  Knowledge: BookOpen,
  Arts: Palette,
  Gaming: Gamepad2,
  Technology: Globe,
  Default: Tag
};

const getCategoryIcon = (opt) => {
  if (opt?.icon) {
    if (typeof opt.icon === 'string') {
      const Matched = CATEGORY_ICON_MAP[opt.icon] || CATEGORY_ICON_MAP[opt.label] || Tag;
      return <Matched className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    const IconComp = opt.icon;
    return <IconComp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  }
  const Matched = CATEGORY_ICON_MAP[opt?.label] || Tag;
  return <Matched className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
};

export const MultiSelect = ({
  options = [],
  value,
  selected,
  onChange,
  placeholder = 'Search & select items...',
  disabled = false,
  className = ''
}) => {
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
    if (disabled) return;
    if (activeValue.includes(val)) {
      onChange(activeValue.filter(v => v !== val));
    } else {
      onChange([...activeValue, val]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allVals = options.map(o => o.value);
    onChange(allVals);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const filteredOptions = options.filter(opt =>
    (opt.label || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative w-full text-left ${className}`} ref={wrapperRef}>
      {/* Selected Items / Trigger Area */}
      <div
        className={`min-h-[44px] w-full bg-slate-900/90 dark:bg-[#0f172a]/95 backdrop-blur-md border ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-slate-800'
            : isOpen
            ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5'
            : 'border-slate-800 hover:border-emerald-500/50'
        } rounded-xl px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-pointer transition-all duration-200`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {activeValue.length === 0 && (
          <span className="text-slate-400 text-xs px-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            {placeholder}
          </span>
        )}

        {activeValue.map(val => {
          const opt = options.find(o => o.value === val) || { value: val, label: val };
          return (
            <span
              key={val}
              className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold shadow-xs transition-all hover:bg-emerald-500/25"
            >
              {getCategoryIcon(opt)}
              <span>{opt.label}</span>
              <X
                className="w-3 h-3 cursor-pointer hover:text-rose-400 transition-colors ml-0.5"
                onClick={(e) => { e.stopPropagation(); handleToggle(val); }}
              />
            </span>
          );
        })}

        <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto cursor-pointer transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-[100] w-full mt-2 bg-slate-900/95 dark:bg-[#0f172a]/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-xs space-y-1 p-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          {/* Search Input Field */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-7 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="flex justify-between items-center px-2 py-1 text-[10px] border-b border-slate-800/80 pb-2 mb-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider">
              {filteredOptions.length} Items Available
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-emerald-400 hover:text-emerald-300 hover:underline font-bold cursor-pointer transition"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-rose-400 hover:text-rose-300 hover:underline font-bold cursor-pointer transition"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* List Items */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-4 text-xs text-slate-400 text-center font-medium">No matching items found.</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = activeValue.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleToggle(opt.value)}
                    className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between transition-all duration-150 ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(opt)}
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />}
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
