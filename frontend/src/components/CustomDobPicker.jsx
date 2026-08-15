import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDobPicker = ({
  value = '',
  onChange,
  required = false,
  label = 'Date of Birth (DOB) *'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initialDate = value ? new Date(value) : null;
  const currentYearNow = new Date().getFullYear();
  const defaultYear = currentYearNow - 20;

  const [viewYear, setViewYear] = useState(initialDate ? initialDate.getFullYear() : defaultYear);
  const [viewMonth, setViewMonth] = useState(initialDate ? initialDate.getMonth() : 0);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Generate Year options from current year down to 1930
  const yearOptions = [];
  for (let y = currentYearNow; y >= 1930; y--) {
    yearOptions.push(y);
  }

  // Calculate age accurately
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

  // Calculate days in view month
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
        <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {ageVal !== null && (
            <span className="text-[11px] font-bold text-brandPrimary font-mono">
              ({ageVal} yrs old)
            </span>
          )}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-[48px] w-full bg-slate-800/80 border rounded-xl px-3.5 text-xs sm:text-sm text-white font-medium shadow-inner flex items-center justify-between transition-all cursor-pointer ${isOpen
            ? 'border-brandPrimary ring-2 ring-brandPrimary/20 bg-slate-800'
            : 'border-white/10 hover:border-brandPrimary/50'
          }`}
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          {value ? (
            <div className="flex items-center gap-2">
              <span className="font-extrabold font-mono text-white text-xs sm:text-sm">
                {formatDisplayDate(value)}
              </span>
            </div>
          ) : (
            <span className="text-slate-400">Select Date of Birth</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brandPrimary' : ''}`} />
      </button>

      {/* Hidden native input for form validation */}
      <input
        type="text"
        value={value}
        required={required}
        onChange={() => { }}
        tabIndex={-1}
        className="opacity-0 absolute w-0 h-0 pointer-events-none"
      />

      {/* Custom Calendar Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 sm:right-auto sm:w-[330px] mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-4 text-white text-xs space-y-3"
          >
            {/* Header: Month & Year Selectors */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {/* Month Dropdown */}
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="bg-slate-800 border border-white/10 text-white rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:border-brandPrimary cursor-pointer"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="bg-slate-800 border border-white/10 text-white font-mono rounded-lg px-2 py-1 text-xs font-extrabold focus:outline-none focus:border-brandPrimary cursor-pointer"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y} className="bg-slate-900 text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[10px] text-slate-400 uppercase">
              {WEEKDAY_NAMES.map((w) => (
                <div key={w} className="py-1">{w}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono">
              {/* Empty padding slots for days before 1st of month */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-8" />
              ))}

              {/* Month Days */}
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
                    className={`h-8 rounded-xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${isSelected
                        ? 'bg-gradient-to-tr from-brandPrimary to-brandSecondary text-white shadow-lg shadow-brandPrimary/30 font-extrabold scale-105'
                        : 'text-slate-200 hover:bg-brandPrimary/20 hover:text-brandPrimary'
                      }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDobPicker;
