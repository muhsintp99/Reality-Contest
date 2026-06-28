import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSessionsRequest, revokeSessionRequest, logoutAllDevicesRequest } from '../store/authSlice';
import { Monitor, Smartphone, Globe, LogOut, ShieldAlert } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-poppins text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-400" />
            <span>Active Login Sessions</span>
          </h2>
          <p className="text-xs text-white/50">Monitor and revoke devices currently authorized to access your platform assets.</p>
        </div>
        
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            disabled={revokingAll}
            className="px-4 py-2 border border-red-500/20 hover:border-red-500/30 bg-red-500/10 text-red-400 hover:text-red-300 disabled:opacity-50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{revokingAll ? 'Revoking...' : 'Logout Other Devices'}</span>
          </button>
        )}
      </div>

      <div className="glassmorphism rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-xl">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-xs">
            Loading active sessions...
          </div>
        ) : (
          sessions.map((sess) => {
            const isMobile = sess.device.toLowerCase().includes('mobile') || sess.device.toLowerCase().includes('ios') || sess.device.toLowerCase().includes('android');
            
            return (
              <div key={sess._id} className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/70">
                    {isMobile ? <Smartphone className="w-5 h-5 text-cyan-400" /> : <Monitor className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <span>{sess.device}</span>
                      <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded font-normal">
                        {sess.browser}
                      </span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40 mt-1">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-white/30" /> {sess.ip}
                      </span>
                      <span>•</span>
                      <span>Logged in: {new Date(sess.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(sess._id)}
                  disabled={loadingId === sess._id}
                  className="p-2 border border-white/10 hover:border-red-500/20 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 disabled:opacity-50 rounded-xl transition-all"
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
