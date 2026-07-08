import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { loadCurrentUserRequest, logoutRequest } from './store/authSlice';
import { ThemeProvider } from './context/ThemeContext';
import { AdminDashboardLayout } from './layouts/AdminDashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PermissionGuard } from './components/PermissionGuard';
import { DashboardHome } from './pages/DashboardHome';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ContestManagement } from './pages/ContestManagement';
import { QuizBuilder } from './pages/QuizBuilder';
import { StageManagement } from './pages/StageManagement';
import { UsersDirectory } from './pages/UsersDirectory';
import { NotificationsPage } from './pages/NotificationsPage';

const AppContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isMockMode } = useSelector((state) => state.auth);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedRole, setSelectedRole] = useState('Admin');

  useEffect(() => {
    if (!isMockMode) {
      dispatch(loadCurrentUserRequest());
    }
  }, [isMockMode, dispatch]);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  // Sync activeView with the route path
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    const validViews = ['dashboard', 'users', 'contests', 'categories', 'stages', 'analytics', 'settings', 'profile', 'notifications'];
    if (validViews.includes(path)) {
      setActiveView(path);
    }
  }, [location]);

  const handleLogout = () => {
    dispatch(logoutRequest({ callback: () => navigate('/login') }));
  };

  // If user is authenticated and is on /login or /, redirect to /admin-dashboard/dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const isAdmin = ['Admin', 'Super Admin'].includes(user?.role);
      if (isAdmin) {
        if (location.pathname === '/' || location.pathname === '/login') {
          navigate('/admin-dashboard/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, location, navigate]);

  return (
    <Routes>
      <Route path="/login" element={
        <Login
          onForgotClick={() => navigate('/forgot-password')}
          onLoginSuccess={() => navigate('/admin-dashboard/dashboard')}
        />
      } />
      <Route path="/forgot-password" element={
        <ForgotPassword
          onBackToLogin={() => navigate('/login')}
        />
      } />
      <Route path="/" element={<Navigate to="/admin-dashboard/dashboard" replace />} />
      <Route path="/admin-dashboard" element={<Navigate to="/admin-dashboard/dashboard" replace />} />
      
      <Route path="/admin-dashboard/:view" element={
        <ProtectedRoute>
          <AdminDashboardLayout
            activeView={activeView}
            onLogout={handleLogout}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          >
            {/* View router condition */}
            {activeView === 'dashboard' && (
              <DashboardHome onViewChange={(view) => navigate(`/admin-dashboard/${view}`)} selectedRole={selectedRole} />
            )}
            
            {activeView === 'analytics' && (
              <PermissionGuard requiredRole="Super Admin">
                <AnalyticsPage />
              </PermissionGuard>
            )}
            
            {activeView === 'settings' && (
              <SettingsPage />
            )}
            
            {activeView === 'profile' && (
              <SettingsPage />
            )}
            
            {activeView === 'users' && (
              <UsersDirectory />
            )}
            
            {activeView === 'contests' && (
              <ContestManagement />
            )}
            
            {activeView === 'stages' && (
              <StageManagement />
            )}
            
            {activeView === 'categories' && (
              <PermissionGuard requiredRole="Super Admin">
                <QuizBuilder />
              </PermissionGuard>
            )}
            
            {activeView === 'notifications' && (
              <NotificationsPage />
            )}
          </AdminDashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/admin-dashboard/dashboard" replace />} />
    </Routes>
  );
};

export const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
