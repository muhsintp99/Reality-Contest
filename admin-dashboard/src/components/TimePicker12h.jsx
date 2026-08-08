import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const TimePicker12h = ({ value, onChange, label }) => {
  // Parse initial 12h string value (e.g. "09:00 AM" or "09:00")
  const parseValue = (valStr) => {
    if (!valStr) return { hour: '09', minute: '00', period: 'AM' };
    const parts = valStr.trim().split(' ');
    const timePart = parts[0] || '09:00';
    let period = (parts[1] || 'AM').toUpperCase();
    
    let [hStr, mStr] = timePart.split(':');
    let h = parseInt(hStr, 10) || 9;
    let m = parseInt(mStr, 10) || 0;

    if (h > 12) {
      h = h - 12;
      period = 'PM';
    } else if (h === 0) {
      h = 12;
      period = 'AM';
    }

    const formattedHour = String(h).padStart(2, '0');
    const formattedMinute = String(m).padStart(2, '0');

    return {
      hour: formattedHour,
      minute: formattedMinute,
      period: period === 'PM' ? 'PM' : 'AM'
    };
  };

  const initial = parseValue(value);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState(initial.period);

  useEffect(() => {
    const updated = parseValue(value);
    setHour(updated.hour);
    setMinute(updated.minute);
    setPeriod(updated.period);
  }, [value]);

  const updateFormattedTime = (newH, newM, newP) => {
    const formatted = `${newH}:${newM} ${newP}`;
    onChange(formatted);
  };

  const handleHourChange = (e) => {
    const newH = e.target.value;
    setHour(newH);
    updateFormattedTime(newH, minute, period);
  };

  const handleMinuteChange = (e) => {
    const newM = e.target.value;
    setMinute(newM);
    updateFormattedTime(hour, newM, period);
  };

  const togglePeriod = (newP) => {
    setPeriod(newP);
    updateFormattedTime(hour, minute, newP);
  };

  const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '59'];

  return (
    <div className="space-y-1 text-left">
      {label && <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">{label}</label>}
      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-1.5 rounded-xl text-xs">
        <Clock className="w-4 h-4 text-amber-500 ml-1.5 shrink-0" />
        
        {/* Hour Select */}
        <select
          value={hour}
          onChange={handleHourChange}
          className="bg-transparent font-mono font-bold text-slate-900 dark:text-white text-xs focus:outline-none cursor-pointer py-1"
        >
          {HOURS.map(h => (
            <option key={h} value={h} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {h}
            </option>
          ))}
        </select>

        <span className="font-bold text-slate-400 dark:text-slate-500 font-mono">:</span>

        {/* Minute Select */}
        <select
          value={minute}
          onChange={handleMinuteChange}
          className="bg-transparent font-mono font-bold text-slate-900 dark:text-white text-xs focus:outline-none cursor-pointer py-1"
        >
          {MINUTES.map(m => (
            <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {m}
            </option>
          ))}
        </select>

        {/* AM / PM Toggle Pills */}
        <div className="flex items-center gap-0.5 bg-slate-200/60 dark:bg-white/10 p-0.5 rounded-lg ml-auto">
          <button
            type="button"
            onClick={() => togglePeriod('AM')}
            className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
              period === 'AM'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => togglePeriod('PM')}
            className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
              period === 'PM'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePicker12h;
