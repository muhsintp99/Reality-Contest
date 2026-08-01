import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse p-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10">
      <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-full mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-6 bg-slate-100 dark:bg-white/5 rounded-lg flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-3">
          <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2"></div>
          <div className="h-7 bg-slate-300 dark:bg-white/20 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="space-y-6 text-left animate-pulse p-4">
      <div className="h-20 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 p-5"></div>
      <CardSkeleton count={4} />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
};

export default PageSkeleton;
