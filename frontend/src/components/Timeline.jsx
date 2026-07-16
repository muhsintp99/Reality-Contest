import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, Award, Users } from 'lucide-react';

const iconsMap = {
  meeting: Video,
  review: Award,
  audition: Users,
  default: Calendar
};

export const Timeline = ({ events = [], title = "Timeline & Schedule" }) => {
  return (
    <div className="glassmorphism p-5 rounded-[24px] border border-white/20 dark:border-white/5 shadow-premium text-left bg-white/70 dark:bg-slate-900/40 flex-1 flex flex-col h-full">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-brandPrimary" />
          <span>{title}</span>
        </h3>
        <span className="text-[10px] text-slate-400 font-semibold">Today</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 max-h-[300px] relative pl-4">
        {/* Timeline bar track */}
        <div className="absolute left-[23px] top-2 bottom-2 w-[1.5px] bg-slate-100 dark:bg-white/5" />

        <div className="space-y-4">
          {events.map((event, index) => {
            const EventIcon = iconsMap[event.type] || iconsMap.default;
            return (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Timeline Node dot */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border z-10 flex-shrink-0 ${
                  event.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                  event.color === 'teal' ? 'bg-teal-500/10 border-teal-500/30 text-teal-500' :
                  event.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                  'bg-indigo-500/10 border-indigo-500/30 text-indigo-500'
                }`}>
                  <EventIcon className="w-3 h-3" />
                </div>

                {/* Event Description Card */}
                <div className="flex-1 p-3.5 bg-white/40 border border-slate-100 dark:bg-[#080b12]/20 dark:border-white/5 rounded-2xl flex flex-col justify-between hover:bg-slate-50/50 dark:hover:bg-[#080b12]/30 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-slate-855 dark:text-white/80 leading-tight">
                      {event.title}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-semibold whitespace-nowrap bg-slate-100/60 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-slate-200/20 dark:border-white/5">
                      {event.time}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-white/40 mt-1 leading-snug">
                    {event.description}
                  </p>

                  {event.tag && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        event.color === 'emerald' ? 'bg-emerald-500' :
                        event.color === 'teal' ? 'bg-teal-500' :
                        event.color === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'
                      }`} />
                      <span className="text-[9px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
                        {event.tag}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
