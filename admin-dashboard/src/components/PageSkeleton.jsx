import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse p-5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800">
      <div className="h-9 bg-slate-800/80 rounded-xl w-full mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-7 bg-slate-800/40 rounded-lg flex-1"></div>
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
        <div key={i} className="h-32 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="h-3.5 bg-slate-800/80 rounded-md w-1/2"></div>
          <div className="h-8 bg-slate-800/60 rounded-xl w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="space-y-6 text-left animate-pulse p-6 max-w-7xl mx-auto">
      <div className="h-24 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex items-center justify-between">
        <div className="space-y-2 w-1/3">
          <div className="h-6 bg-slate-800/80 rounded-xl w-2/3"></div>
          <div className="h-3.5 bg-slate-800/50 rounded-md w-full"></div>
        </div>
        <div className="h-10 bg-slate-800/80 rounded-xl w-32"></div>
      </div>
      <CardSkeleton count={4} />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
};

export default PageSkeleton;
