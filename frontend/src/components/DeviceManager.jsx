import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSessionsRequest, revokeSessionRequest, logoutAllDevicesRequest } from '../store/authSlice';
import { Monitor, Smartphone, Globe, LogOut, ShieldAlert } from 'lucide-react';
import { Badge } from './common/Badges';

export const DeviceManager = () => {
  const dispatch = useDispatch();
  const { sessions } = useSelector((state) => state.auth);
  const [loadingId, setLoadingId] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    dispatch(fetchSessionsRequest());
  }, [dispatch]);

  const handleRevoke = (id) => {
    setLoadingId(id);
    dispatch(revokeSessionRequest(id));
    setLoadingId(null);
  };

  const handleRevokeAll = () => {
    if (confirm('Are you sure you want to log out of all other devices?')) {
      setRevokingAll(true);
      dispatch(logoutAllDevicesRequest());
      setRevokingAll(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-brandPrimary" />
            <span>Active Login Sessions</span>
          </h2>
          <p className="text-[10px] text-slate-450 dark:text-white/35 font-medium mt-1">Monitor and revoke devices currently authorized to access your platform assets.</p>
        </div>
        
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            disabled={revokingAll}
            className="px-4 py-2 border border-rose-500/20 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 hover:text-rose-500 dark:text-rose-400 disabled:opacity-50 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{revokingAll ? 'Revoking...' : 'Logout Other Devices'}</span>
          </button>
        )}
      </div>

      <div className="glassmorphism rounded-[24px] border border-slate-200/50 dark:border-white/10 overflow-hidden divide-y divide-slate-200/40 dark:divide-white/5 shadow-premium bg-white/70 dark:bg-slate-900/40">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-white/30 text-xs font-semibold animate-pulse">
            Loading active sessions...
          </div>
        ) : (
          sessions.map((sess) => {
            const isMobile = sess.device.toLowerCase().includes('mobile') || sess.device.toLowerCase().includes('ios') || sess.device.toLowerCase().includes('android');
            
            return (
              <div key={sess._id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-white/70">
                    {isMobile ? <Smartphone className="w-5 h-5 text-brandSecondary" /> : <Monitor className="w-5 h-5 text-brandPrimary" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span>{sess.device}</span>
                      <span className="text-[9px] bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/40 px-2 py-0.5 rounded-lg border border-slate-250/20 dark:border-white/5 font-semibold">
                        {sess.browser}
                      </span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-400 dark:text-white/35 mt-1 font-semibold">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400/80 dark:text-white/30" /> {sess.ip}
                      </span>
                      <span>•</span>
                      <span>Logged: {new Date(sess.createdAt).toLocaleDateString()} {new Date(sess.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(sess._id)}
                  disabled={loadingId === sess._id}
                  className="p-2 border border-slate-200 dark:border-white/10 hover:border-rose-500/20 bg-slate-50 dark:bg-white/5 hover:bg-rose-500/10 text-slate-450 hover:text-rose-500 dark:text-white/55 dark:hover:text-white rounded-xl transition-all shadow-sm active:scale-[0.98]"
                  title="Terminate Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default DeviceManager;
