import React from 'react';
import { useSelector } from 'react-redux';
import { ShieldAlert } from 'lucide-react';

export const PermissionGuard = ({ children, requiredRole }) => {
  const { user } = useSelector((state) => state.auth);

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="py-20 text-center space-y-4 animate-fade-in text-white/90">
        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-500">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-poppins text-slate-800 dark:text-white">
            Access Denied
          </h3>
          <p className="text-xs text-slate-500 dark:text-white/40 max-w-sm mx-auto mt-1 font-semibold">
            Only accounts with the "{requiredRole}" role have permission to access this administrative console.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default PermissionGuard;
