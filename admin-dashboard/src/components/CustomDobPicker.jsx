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
  label = 'Date of Birth'
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
        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {ageVal !== null && (
            <span className="text-[10px] font-mono text-brandPrimary font-bold">
              ({ageVal} yrs old)
            </span>
          )}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#080b12] border rounded-xl px-3 py-2 text-xs text-white font-medium flex items-center justify-between transition-all cursor-pointer ${
          isOpen ? 'border-brandPrimary ring-1 ring-brandPrimary/30' : 'border-white/10 hover:border-brandPrimary/50'
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-white/40" />
          {value ? (
            <span className="font-bold font-mono text-white text-xs">{formatDisplayDate(value)}</span>
          ) : (
            <span className="text-white/40">Select Date of Birth</span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isOpen ? 'rotate-180 text-brandPrimary' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 sm:right-auto sm:w-[280px] mt-2 bg-[#0c1322] border border-white/15 rounded-2xl shadow-2xl p-3 text-white text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-[#080b12] border border-white/10 text-white rounded px-1.5 py-0.5 text-[11px] font-bold cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx} className="bg-[#080b12] text-white">{m}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-[#080b12] border border-white/10 text-white font-mono rounded px-1.5 py-0.5 text-[11px] font-bold cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="bg-[#080b12] text-white">{y}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[9px] text-white/40 uppercase">
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
                  className={`h-7 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-brandPrimary text-white shadow-md font-extrabold scale-105'
                      : 'text-white/80 hover:bg-brandPrimary/20 hover:text-brandPrimary'
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
