import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { loadCurrentUserRequest, logoutRequest } from './store/authSlice';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/sidebar/Sidebar';
import { Navbar } from './components/navbar/Navbar';
import { DashboardHome } from './pages/DashboardHome';
import { SettingsPage } from './pages/SettingsPage';
import { KycVerification } from './pages/KycVerification';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ParticipantContestPortal } from './pages/ParticipantContestPortal';
import { WalletDashboard } from './pages/WalletDashboard';
import { NotificationsPage } from './pages/NotificationsPage';
import { RewardsBadgeCenter } from './pages/RewardsBadgeCenter';
import { ShieldAlert, Layers } from 'lucide-react';

const AccessDeniedView = () => {
  const navigate = useNavigate();
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
          Your account role does not have permission to access this page section.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-lg transition-colors hover:bg-brandPrimary/90"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

const ProtectedMemberRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Auto-redirect administrative accounts to port 10002
  if (['Admin', 'Super Admin'].includes(user?.role)) {
    return (
      <div className="min-h-screen bg-[#080b12] text-white flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md w-full glassmorphism p-8 rounded-2xl border border-white/10 space-y-6">
          <h3 className="text-xl font-bold font-poppins text-white">Redirecting to Admin Dashboard...</h3>
          <p className="text-xs text-white/50">You are logged in as an administrator. Redirecting you to port 10002.</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <AccessDeniedView />;
  }

  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isMockMode } = useSelector((state) => state.auth);
  const [activeView, setActiveView] = useState('dashboard');
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Contestant');

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

  // Handle auto-redirection of Admin/Super Admin users
  useEffect(() => {
    if (isAuthenticated && user?.role && ['Admin', 'Super Admin'].includes(user.role)) {
      window.location.href = window.location.protocol + '//' + window.location.hostname + ':10002';
    }
  }, [isAuthenticated, user]);

  // Sync activeView state with the URL path
  useEffect(() => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const validViews = ['dashboard', 'contests', 'wallet', 'rewards', 'notifications', 'settings', 'profile', 'judge', 'sponsor'];
    if (validViews.includes(path)) {
      setActiveView(path);
    }
  }, [location]);

  const handleLogout = () => {
    dispatch(logoutRequest({ callback: () => navigate('/login') }));
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-darkBg dark:bg-darkBg light:bg-lightBg text-white dark:text-white light:text-black transition-colors duration-300">
        
        {/* Sidebar Frame Navigation */}
        <Sidebar
          activeView={activeView}
          onLogout={handleLogout}
          isOpenMobile={isOpenMobileMenu}
          setIsOpenMobile={setIsOpenMobileMenu}
          role={selectedRole}
        />

        {/* Main Content frame */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            activeView={activeView}
            onOpenMobileMenu={() => setIsOpenMobileMenu(true)}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />

          <main className="flex-1 p-6 overflow-y-auto aurora-bg">
            <Routes>
              {/* Contestant Routes */}
              <Route path="/" element={
                <ProtectedMemberRoute allowedRoles={['Contestant']}>
                  <DashboardHome onViewChange={(v) => navigate(`/${v}`)} selectedRole={selectedRole} />
                </ProtectedMemberRoute>
              } />
              
              <Route path="/contests" element={
                <ProtectedMemberRoute allowedRoles={['Contestant']}>
                  <ParticipantContestPortal />
                </ProtectedMemberRoute>
              } />

              <Route path="/rewards" element={
                <ProtectedMemberRoute allowedRoles={['Contestant']}>
                  <RewardsBadgeCenter />
                </ProtectedMemberRoute>
              } />

              {/* Judge Routes */}
              <Route path="/judge" element={
                <ProtectedMemberRoute allowedRoles={['Judge']}>
                  <DashboardHome onViewChange={(v) => navigate(`/${v}`)} selectedRole={selectedRole} />
                </ProtectedMemberRoute>
              } />

              {/* Sponsor Routes */}
              <Route path="/sponsor" element={
                <ProtectedMemberRoute allowedRoles={['Sponsor']}>
                  <DashboardHome onViewChange={(v) => navigate(`/${v}`)} selectedRole={selectedRole} />
                </ProtectedMemberRoute>
              } />

              {/* Shared Member Routes */}
              <Route path="/wallet" element={
                <ProtectedMemberRoute allowedRoles={['Contestant', 'Judge', 'Sponsor']}>
                  <WalletDashboard />
                </ProtectedMemberRoute>
              } />

              <Route path="/notifications" element={
                <ProtectedMemberRoute allowedRoles={['Contestant', 'Judge', 'Sponsor']}>
                  <NotificationsPage />
                </ProtectedMemberRoute>
              } />

              <Route path="/settings" element={
                <ProtectedMemberRoute allowedRoles={['Contestant', 'Judge', 'Sponsor']}>
                  <SettingsPage />
                </ProtectedMemberRoute>
              } />

              <Route path="/profile" element={
                <ProtectedMemberRoute allowedRoles={['Contestant', 'Judge', 'Sponsor']}>
                  <SettingsPage />
                </ProtectedMemberRoute>
              } />

              {/* Fallback inside portal */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // Not Authenticated Auth views
  return (
    <div className="min-h-screen bg-[#080b12] text-white transition-colors duration-300">
      {isMockMode && (
        <div className="bg-purple-600/10 border-b border-purple-500/20 px-4 py-2 flex items-center justify-center gap-2 text-center text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-pulse" />
          <span className="text-purple-300">
            SANDBOX SIMULATION ACTIVE: Toggle roles using the selector bar in the portal.
          </span>
        </div>
      )}

      <Routes>
        <Route path="/login" element={
          <Login
            onRegisterClick={() => navigate('/register')}
            onForgotClick={() => navigate('/forgot-password')}
            onLoginSuccess={() => {
              if (['Admin', 'Super Admin'].includes(user?.role)) {
                window.location.href = window.location.protocol + '//' + window.location.hostname + ':10002';
              } else if (user?.role === 'Judge') {
                navigate('/judge');
              } else if (user?.role === 'Sponsor') {
                navigate('/sponsor');
              } else {
                navigate('/');
              }
            }}
          />
        } />
        
        <Route path="/register" element={
          <Register
            onLoginClick={() => navigate('/login')}
            onRegisterSuccess={() => navigate('/login')}
          />
        } />

        <Route path="/forgot-password" element={
          <ForgotPassword
            onBackToLogin={() => navigate('/login')}
          />
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
