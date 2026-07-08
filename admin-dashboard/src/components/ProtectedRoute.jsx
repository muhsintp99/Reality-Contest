import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user role is NOT Admin or Super Admin, redirect them to the member portal
  const isAdmin = ['Admin', 'Super Admin'].includes(user?.role);
  if (!isAdmin) {
    // Redirect to the frontend member app on port 10001
    const targetUrl = window.location.protocol + '//' + window.location.hostname + ':10001';
    window.location.href = targetUrl;
    return (
      <div className="min-h-screen bg-[#080b12] text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glassmorphism p-8 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-xl font-bold font-poppins text-white">Redirecting to Member Portal</h3>
          <p className="text-xs text-white/50">Your account does not have administrative access. Redirecting you to the main platform...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
