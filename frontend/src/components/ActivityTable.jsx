import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Clock, Eye } from 'lucide-react';
import { Badge } from './common/Badges';

export const ActivityTable = ({ 
  data = [], 
  title = "Recent Activity Logs", 
  rowsPerPage = 4 
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculation
  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="glassmorphism rounded-[24px] border border-white/20 dark:border-white/5 shadow-premium text-left bg-white/70 dark:bg-slate-900/40 overflow-hidden flex flex-col justify-between">
      {/* Header section */}
      <div className="p-5 flex justify-between items-center border-b border-slate-100 dark:border-white/5 bg-white/30 dark:bg-transparent">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
            {title}
          </h3>
          <p className="text-[10px] text-slate-450 dark:text-white/30 mt-0.5 font-medium">Monitoring platform logs and review submissions.</p>
        </div>
        <span className="text-[10px] bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20 px-2.5 py-0.5 rounded-full font-bold">
          Live Sync
        </span>
      </div>

      {/* Table grid wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700 dark:text-white/80">
          <thead className="text-[10px] uppercase font-bold text-slate-400 dark:text-white/30 bg-slate-50/50 dark:bg-[#080b12]/10 border-b border-slate-100 dark:border-white/5">
            <tr>
              <th scope="col" className="px-6 py-3.5">Contestant Name</th>
              <th scope="col" className="px-6 py-3.5">Competitions Portal</th>
              <th scope="col" className="px-6 py-3.5">Medium / Type</th>
              <th scope="col" className="px-6 py-3.5">Submission Time</th>
              <th scope="col" className="px-6 py-3.5">Verdict Status</th>
              <th scope="col" className="px-6 py-3.5 text-right">Score Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {currentRows.length > 0 ? (
              currentRows.map((row, index) => (
                <motion.tr
                  key={row.id || index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-slate-50/70 dark:hover:bg-white/2 transition-colors duration-200"
                >
                  <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brandPrimary/10 to-brandSecondary/10 text-brandPrimary dark:text-brandSecondary flex items-center justify-center font-bold text-[10px] border border-brandPrimary/20">
                      {row.name.charAt(0)}
                    </div>
                    <span>{row.name}</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500 dark:text-white/50 max-w-[200px] truncate">
                    {row.contest}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200/50 dark:border-white/5 text-[10px] font-semibold text-slate-500 dark:text-white/40">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 dark:text-white/30 font-medium">
                    {row.time}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge variant={row.status === 'Approved' ? 'secondary' : 'warning'}>
                      <span className="flex items-center gap-1">
                        {row.status === 'Approved' ? (
                          <Check className="w-2.5 h-2.5" />
                        ) : (
                          <Clock className="w-2.5 h-2.5 animate-pulse" />
                        )}
                        {row.status}
                      </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right font-extrabold text-slate-800 dark:text-white font-sans">
                    {row.score > 0 ? (
                      <span className="text-brandPrimary dark:text-brandSecondary">{row.score} pts</span>
                    ) : (
                      <span className="text-slate-300 dark:text-white/10">—</span>
                    )}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-400 dark:text-white/20 font-semibold">
                  No activity records loaded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls footer */}
      {totalPages > 1 && (
        <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-transparent">
          <span className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider">
            Page {currentPage} of {totalPages}
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 text-slate-500 dark:text-white/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 text-slate-500 dark:text-white/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTable;
