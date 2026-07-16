import React from 'react';

export const HakaLogo = ({ variant = 'full', className = '', size = 120 }) => {
  // SVG paths for the H icon
  const iconSvg = (
    <img
      src="/haka_favicon.png"
      className="w-full h-full object-contain"
      alt="Haka"
    />
  );

  // SVG paths for the HΛKΛ text
  const textSvg = (
    <svg
      viewBox="0 0 200 60"
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="text-slate-900 dark:text-white transition-colors duration-300">
        {/* Letter H */}
        <path d="M 42,20 L 42,40 M 42,30 L 54,30 M 54,20 L 54,40" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
        {/* Letter Λ */}
        <path d="M 64,40 L 73,20 L 82,40" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Letter K */}
        <path d="M 93,20 L 93,40 M 93,30 L 105,20 M 99,25 L 105,40" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
        {/* Letter Λ */}
        <path d="M 117,40 L 126,20 L 135,40" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text
        x="88"
        y="56"
        textAnchor="middle"
        fill="#10B981"
        fontSize="8"
        fontWeight="700"
        fontFamily="sans-serif"
        letterSpacing="1.2"
      >
        WIN BEYOND REWARDS
      </text>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        {iconSvg}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <div style={{ width: size * 0.45, height: size * 0.45 }}>
          {iconSvg}
        </div>
        <div className="flex flex-col justify-center text-left">
          <div className="flex items-center">
            {/* Minimal inline SVG wordmark for HΛKΛ */}
            <svg viewBox="0 0 100 25" width={size * 0.75} className="h-6 text-slate-900 dark:text-white transition-colors duration-300">
              <path d="M 10,2 L 10,22 M 10,12 L 20,12 M 20,2 L 20,22" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 28,22 L 35,2 L 42,22" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 50,2 L 50,22 M 50,12 L 60,2 M 55,10 L 60,22" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 68,22 L 75,2 L 82,22" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[9px] text-[#10B981] font-bold tracking-widest leading-none mt-1 uppercase">
            Win Beyond Rewards
          </span>
        </div>
      </div>
    );
  }

  // default: variant === 'full'
  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`} style={{ width: size }}>
      <div className="w-full h-auto mb-2">
        {iconSvg}
      </div>
      <div className="w-full">
        {textSvg}
      </div>
    </div>
  );
};

export default HakaLogo;
