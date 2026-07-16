import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';

export const MultiSelect = ({ options = [], value = [], onChange, placeholder = 'Select options...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (val) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabels = value.map(val => {
    const opt = options.find(o => o.value === val);
    return opt ? opt.label : val;
  });

  return (
    <div className="relative w-full text-left" ref={wrapperRef}>
      <div 
        className="min-h-[42px] w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-1.5 flex flex-wrap gap-2 items-center cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {selectedLabels.length === 0 && !searchTerm && (
          <span className="text-white/40 text-xs px-1">{placeholder}</span>
        )}
        
        {value.map(val => {
          const opt = options.find(o => o.value === val);
          return (
            <span 
              key={val} 
              className="bg-brandPrimary/20 text-brandPrimary border border-brandPrimary/20 text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-medium"
            >
              {opt ? opt.label : val}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-white" 
                onClick={(e) => { e.stopPropagation(); handleToggle(val); }} 
              />
            </span>
          );
        })}
        
        <input 
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-xs text-white min-w-[60px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={() => setIsOpen(true)}
          placeholder={selectedLabels.length === 0 ? "" : "..."}
        />
        
        <ChevronDown className="w-4 h-4 text-white/50 ml-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-[#080b12] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-white/40 text-center">No results found.</div>
          ) : (
            <div className="p-1 space-y-0.5">
              {filteredOptions.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleToggle(opt.value)}
                    className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-brandPrimary/10 text-brandPrimary font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
