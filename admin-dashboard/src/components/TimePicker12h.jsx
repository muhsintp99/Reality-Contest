import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const TimePicker12h = ({ value, onChange, label, disabled = false }) => {
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
    if (disabled) return;
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
    if (disabled) return;
    setPeriod(newP);
    updateFormattedTime(hour, minute, newP);
  };

  const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '59'];

  return (
    <div className="space-y-1.5 text-left">
      {label && <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</label>}
      <div className={`flex items-center gap-2 bg-slate-900/90 dark:bg-[#0f172a]/95 backdrop-blur-md border ${disabled ? 'opacity-50 cursor-not-allowed border-slate-800' : 'border-slate-800 hover:border-emerald-500/50 focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20'} p-2 rounded-xl text-xs transition-all duration-200`}>
        <Clock className="w-4 h-4 text-emerald-400 ml-1 shrink-0" />
        
        {/* Hour Select */}
        <select
          disabled={disabled}
          value={hour}
          onChange={handleHourChange}
          className="bg-slate-950/80 border border-slate-800/80 rounded-lg px-2 py-1 font-mono font-bold text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          {HOURS.map(h => (
            <option key={h} value={h} className="bg-slate-900 text-white">
              {h}
            </option>
          ))}
        </select>

        <span className="font-bold text-emerald-400 font-mono">:</span>

        {/* Minute Select */}
        <select
          disabled={disabled}
          value={minute}
          onChange={handleMinuteChange}
          className="bg-slate-950/80 border border-slate-800/80 rounded-lg px-2 py-1 font-mono font-bold text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          {MINUTES.map(m => (
            <option key={m} value={m} className="bg-slate-900 text-white">
              {m}
            </option>
          ))}
        </select>

        {/* AM / PM Toggle Pills */}
        <div className="flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/80 ml-auto">
          <button
            type="button"
            disabled={disabled}
            onClick={() => togglePeriod('AM')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all duration-150 cursor-pointer ${
              period === 'AM'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => togglePeriod('PM')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all duration-150 cursor-pointer ${
              period === 'PM'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
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
