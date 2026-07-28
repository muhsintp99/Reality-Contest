import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCounts, setUnreadCounts] = useState({
    contestant: 0,
    judge: 0,
    sponsor: 0,
    kyc: 0,
    contest: 0,
    finance: 0,
    support: 0,
    marketing: 0,
    analytics: 0,
    system: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchCounts = async () => {
    try {
      const res = await axios.get('/api/admin/sidebar-counts', { withCredentials: true });
      if (res.data.success && res.data.counts) {
        setUnreadCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch notification counts:', err);
    }
  };

  const markModuleAsRead = async (moduleName) => {
    try {
      setLoading(true);
      const res = await axios.patch(`/api/notifications/read/module/${moduleName}`, {}, { withCredentials: true });
      if (res.data.success && res.data.unreadCounts) {
        setUnreadCounts(res.data.unreadCounts);
      }
    } catch (err) {
      console.error(`Failed to mark module ${moduleName} notifications as read:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    // Poll counts every 15 seconds to keep dashboard dynamic
    const interval = setInterval(fetchCounts, 15000);
    
    const handleRefetch = () => fetchCounts();
    window.addEventListener('refetch-sidebar-counts', handleRefetch);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refetch-sidebar-counts', handleRefetch);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCounts, fetchCounts, markModuleAsRead, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};
