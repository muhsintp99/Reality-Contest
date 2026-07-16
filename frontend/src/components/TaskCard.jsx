import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Badge } from './common/Badges';

export const TaskCard = ({ tasks = [], onToggleTask, title = "Today's Priorities" }) => {
  return (
    <div className="glassmorphism p-5 rounded-[24px] border border-white/20 dark:border-white/5 shadow-premium text-left bg-white/70 dark:bg-slate-900/40 flex-1 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
          {title}
        </h3>
        <span className="text-[10px] text-slate-400 font-semibold">{tasks.length} Active</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[300px]">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => onToggleTask && onToggleTask(task.id)}
              className={`flex items-start justify-between gap-3 p-3 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all select-none ${
                task.completed 
                  ? 'bg-slate-50/50 border-slate-100 dark:bg-white/2 dark:border-white/2 opacity-60' 
                  : 'bg-white border-slate-100 dark:bg-[#080b12]/30 dark:border-white/5'
              }`}
            >
              <div className="flex gap-2.5 items-start">
                <button className="mt-0.5 text-slate-400 hover:text-brandPrimary transition-colors flex-shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-brandSecondary fill-brandSecondary/10" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <div className="space-y-1">
                  <span className={`text-xs font-semibold block leading-tight text-slate-700 dark:text-white/80 ${task.completed ? 'line-through text-slate-400 dark:text-white/30' : ''}`}>
                    {task.text}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-white/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.time}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <Badge variant={
                  task.priority === 'High' ? 'danger' : 
                  task.priority === 'Medium' ? 'warning' : 'primary'
                }>
                  {task.priority}
                </Badge>
                <span className={`text-[9px] font-bold ${task.completed ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {task.completed ? 'Done' : 'Pending'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskCard;
