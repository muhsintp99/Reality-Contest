import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDobPicker = ({
  value = '',
  onChange,
  required = false,
  label = 'Date of Birth',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initialDate = value ? new Date(value) : null;
  const currentYearNow = new Date().getFullYear();
  const defaultYear = currentYearNow - 20;

  const [viewYear, setViewYear] = useState(initialDate ? initialDate.getFullYear() : defaultYear);
  const [viewMonth, setViewMonth] = useState(initialDate ? initialDate.getMonth() : 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const yearOptions = [];
  for (let y = currentYearNow; y >= 1930; y--) {
    yearOptions.push(y);
  }

  const calculateAge = (dateStr) => {
    if (!dateStr) return null;
    const dob = new Date(dateStr);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const ageVal = calculateAge(value);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day) => {
    if (disabled) return;
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formattedDate = `${viewYear}-${monthStr}-${dayStr}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const monthName = MONTH_NAMES[d.getMonth()].slice(0, 3);
    const year = d.getFullYear();
    return `${day} ${monthName} ${year}`;
  };

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      {label && (
        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {ageVal !== null && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {ageVal} yrs old
            </span>
          )}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-slate-900/90 dark:bg-[#0f172a]/95 border rounded-xl px-3.5 py-2.5 text-xs text-white font-medium flex items-center justify-between transition-all duration-200 cursor-pointer ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-slate-800'
            : isOpen
            ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5'
            : 'border-slate-800 hover:border-emerald-500/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          {value ? (
            <span className="font-bold font-mono text-white text-xs">{formatDisplayDate(value)}</span>
          ) : (
            <span className="text-slate-400">Select Date of Birth</span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 sm:right-auto sm:w-[280px] mt-2 bg-slate-900/95 dark:bg-[#0f172a]/95 border border-slate-800 rounded-2xl shadow-2xl p-3.5 text-white text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2 py-1 text-[11px] font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx} className="bg-slate-900 text-white">{m}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-white font-mono rounded-lg px-2 py-1 text-[11px] font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-white">{y}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[9px] text-slate-400 uppercase tracking-wider">
            {WEEKDAY_NAMES.map((w) => <div key={w}>{w}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const monthStr = String(viewMonth + 1).padStart(2, '0');
              const dayStr = String(dayNum).padStart(2, '0');
              const dateIso = `${viewYear}-${monthStr}-${dayStr}`;
              const isSelected = value === dateIso;

              return (
                <button
                  type="button"
                  key={dayNum}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 rounded-lg font-bold text-[11px] transition-all duration-150 flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20 scale-105'
                      : 'text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-400'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDobPicker;
