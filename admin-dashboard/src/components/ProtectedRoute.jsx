import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#EDF6E5] dark:bg-[#080b12] text-slate-800 dark:text-white flex items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="max-w-md w-full glassmorphism p-8 rounded-3xl border border-[#C4E2A8]/70 dark:border-white/10 space-y-4 shadow-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brandPrimary/20 border-t-brandPrimary mx-auto"></div>
          <h3 className="text-xl font-bold font-poppins text-slate-900 dark:text-white">Loading...</h3>
          <p className="text-xs text-slate-500 dark:text-white/40 font-semibold">Initializing admin console...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user role is NOT Admin or Super Admin or Manager, redirect them to the member portal
  const adminRoles = [
    'Super Admin',
    'Admin',
    'Contest Manager',
    'Question Manager',
    'Finance Manager',
    'Support Manager',
    'Support Executive',
    'Marketing Manager',
    'Content Moderator',
    'KYC Officer',
    'Analytics Manager'
  ];
  const isAdmin = adminRoles.includes(user?.role);
  if (!isAdmin) {
    // Redirect to the frontend member app on port 10001
    const targetUrl = window.location.protocol + '//' + window.location.hostname + ':10001';
    window.location.href = targetUrl;
    return (
      <div className="min-h-screen bg-[#EDF6E5] dark:bg-[#080b12] text-slate-800 dark:text-white flex items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="max-w-md w-full glassmorphism p-8 rounded-3xl border border-[#C4E2A8]/70 dark:border-white/10 space-y-4 shadow-xl">
          <h3 className="text-xl font-bold font-poppins text-slate-900 dark:text-white">Redirecting to Member Portal</h3>
          <p className="text-xs text-slate-500 dark:text-white/50 font-semibold">Your account does not have administrative access. Redirecting you to the main platform...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
