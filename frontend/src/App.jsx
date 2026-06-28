import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadCurrentUserRequest, logoutRequest } from './store/authSlice';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/sidebar/Sidebar';
import { Navbar } from './components/navbar/Navbar';
import { DashboardHome } from './pages/DashboardHome';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { KycVerification } from './pages/KycVerification';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ContestManagement } from './pages/ContestManagement';
import { GroupManagement } from './pages/GroupManagement';
import { StageManagement } from './pages/StageManagement';
import { QuizBuilder } from './pages/QuizBuilder';
import { ParticipantContestPortal } from './pages/ParticipantContestPortal';
import { WalletDashboard } from './pages/WalletDashboard';
import { 
  ShieldAlert, Sparkles, Trophy, Users, Award, ShieldCheck, 
  MessageSquare, HelpCircle, Layers, Milestone, BarChart3, Mail
} from 'lucide-react';

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isMockMode } = useSelector((state) => state.auth);
  const [view, setView] = useState('login'); // login, register, forgot
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

  const showLogin = () => setView('login');
  const showRegister = () => setView('register');
  const showForgot = () => setView('forgot');

  const handleLogout = () => {
    dispatch(logoutRequest({ callback: showLogin }));
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-darkBg dark:bg-darkBg light:bg-lightBg text-white dark:text-white light:text-black transition-colors duration-300">
        
        {/* Sidebar Frame Navigation */}
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          onLogout={handleLogout} 
          isOpenMobile={isOpenMobileMenu}
          setIsOpenMobile={setIsOpenMobileMenu}
        />

        {/* Main Content frame */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar 
            activeView={activeView}
            onViewChange={setActiveView}
            onOpenMobileMenu={() => setIsOpenMobileMenu(true)}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
          
          <main className="flex-1 p-6 overflow-y-auto aurora-bg">
            
            {/* 1. Dashboard View */}
            {activeView === 'dashboard' && (
              <DashboardHome onViewChange={setActiveView} selectedRole={selectedRole} />
            )}

            {/* 2. Analytics View */}
            {activeView === 'analytics' && (
              <AnalyticsPage />
            )}

            {/* 3. Settings View */}
            {activeView === 'settings' && (
              <SettingsPage />
            )}

            {/* 4. Profile View */}
            {activeView === 'profile' && (
              <SettingsPage /> // redirects to General/Profile tab
            )}

            {/* 5. KYC View */}
            {activeView === 'kyc' && (
              <KycVerification />
            )}

            {/* 6. Users Directory View */}
            {activeView === 'users' && (
              <UsersDirectory />
            )}

            {/* 7. Contests / Auditions Explorer */}
            {activeView === 'contests' && (
              ['Admin', 'Super Admin'].includes(selectedRole) ? <ContestManagement /> : <ParticipantContestPortal />
            )}

            {/* 8. Wallet view */}
            {activeView === 'wallet' && (
              <WalletDashboard />
            )}

            {/* 9. Rewards & Gamification View */}
            {activeView === 'rewards' && (
              <RewardsBadgeCenter />
            )}

            {/* 10. Stages Builder View */}
            {activeView === 'stages' && (
              <StageManagement />
            )}

            {/* 11. Categories / Quiz Builder View */}
            {activeView === 'categories' && (
              <QuizBuilder />
            )}

            {/* Placeholder view fallbacks to prevent broken displays */}
            {!['dashboard', 'analytics', 'settings', 'profile', 'kyc', 'users', 'contests', 'wallet', 'rewards', 'stages', 'categories'].includes(activeView) && (
              <PlaceholderView viewName={activeView} onViewChange={setActiveView} />
            )}

          </main>
        </div>
      </div>
    );
  }

  // Not Authenticated flow
  return (
    <div className="min-h-screen bg-[#080b12] text-white transition-colors duration-300">
      {isMockMode && (
        <div className="bg-purple-600/10 border-b border-purple-500/20 px-4 py-2 flex items-center justify-center gap-2 text-center text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-pulse" />
          <span className="text-purple-300">
            MOCK MODE ACTIVE: Click Simulator toggler at the top right of login to run backend API validations.
          </span>
        </div>
      )}

      {view === 'login' && (
        <Login 
          onRegisterClick={showRegister} 
          onForgotClick={showForgot} 
          onLoginSuccess={() => setActiveView('dashboard')}
        />
      )}

      {view === 'register' && (
        <Register 
          onLoginClick={showLogin} 
          onRegisterSuccess={showLogin} 
        />
      )}

      {view === 'forgot' && (
        <ForgotPassword 
          onBackToLogin={showLogin} 
        />
      )}
    </div>
  );
};

// ==========================================
// DYNAMIC SUB-VIEW MODULES
// ==========================================

const UsersDirectory = () => {
  const [search, setSearch] = useState('');
  const users = [
    { name: 'Aarav Sharma', role: 'Contestant', status: 'Active', score: 980, email: 'aarav@rcp.in' },
    { name: 'Priya Nair', role: 'Contestant', status: 'Active', score: 945, email: 'priya@rcp.in' },
    { name: 'Kabir Sen', role: 'Contestant', status: 'Active', score: 910, email: 'kabir@rcp.in' },
    { name: 'Raj Patel', role: 'Contestant', status: 'Active', score: 850, email: 'raj.patel@realitycontest.in' }
  ];
  
  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-poppins text-white dark:text-white light:text-black">User Directory ledger</h2>
          <p className="text-xs text-white/50">Browse and inspect system contestants, judges, and sponsors.</p>
        </div>
        <button
          onClick={() => alert("Simulated: Exported 184,203 users rows to Excel successfully.")}
          className="px-4 py-2 bg-brandPrimary text-white rounded-xl text-xs font-semibold transition-colors"
        >
          Export CSV Ledger
        </button>
      </div>
      
      <div className="glassmorphism rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-xl">
        <div className="p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs w-72 text-white placeholder-white/30 focus:outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/5 text-white/50 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Platform Role</th>
                <th className="px-6 py-4">XP Score</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80 dark:text-white/80 light:text-black/80">
              {filtered.map((u, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-6 py-4 font-bold text-white dark:text-white light:text-black">{u.name}</td>
                  <td className="px-6 py-4 text-white/50">{u.email}</td>
                  <td className="px-6 py-4">{u.role}</td>
                  <td className="px-6 py-4 font-mono font-bold text-brandSecondary">{u.score} XP</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RewardsBadgeCenter = () => (
  <div className="space-y-6 text-left animate-fade-in">
    <div>
      <h2 className="text-xl font-bold font-poppins text-white dark:text-white light:text-black">XP & Badge Achievements</h2>
      <p className="text-xs text-white/50">Claim points, track streaks, and review unlocked badges.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* XP Card */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
        <div className="p-3 bg-brandPrimary/10 text-brandPrimary rounded-xl">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] text-white/40 uppercase font-bold block">Contestant XP Level</span>
          <span className="text-xl font-extrabold font-poppins">Level 3 (850 XP)</span>
          <div className="w-40 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-brandPrimary rounded-full" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      {/* Badges unlocked */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/10 col-span-2 space-y-3">
        <span className="text-[10px] text-white/40 uppercase font-bold block">Unlocked Badges</span>
        <div className="flex flex-wrap gap-2.5">
          <span className="bg-brandSecondary/15 text-brandSecondary px-3 py-1 rounded-xl text-xs font-bold border border-brandSecondary/25">
            🏆 Quiz Whiz
          </span>
          <span className="bg-brandPrimary/15 text-brandPrimary px-3 py-1 rounded-xl text-xs font-bold border border-brandPrimary/25">
            ⚡ Creator Rookie
          </span>
          <span className="bg-brandAccent/15 text-brandAccent px-3 py-1 rounded-xl text-xs font-bold border border-brandAccent/25">
            💎 AI Verify Verified
          </span>
        </div>
      </div>

    </div>
  </div>
);

const PlaceholderView = ({ viewName, onViewChange }) => (
  <div className="py-16 text-center space-y-4 animate-fade-in text-white/90">
    <div className="inline-flex p-4 bg-white/5 border border-white/10 rounded-full text-brandPrimary">
      <Layers className="w-8 h-8 animate-pulse" />
    </div>
    <div>
      <h3 className="text-lg font-bold font-poppins text-white dark:text-white light:text-black">
        {viewName.charAt(0).toUpperCase() + viewName.slice(1)} Dashboard Module
      </h3>
      <p className="text-xs text-white/40 max-w-sm mx-auto mt-1">
        This view is dynamically routed inside the premium layout container shell. Live auditing data is currently simulating check states.
      </p>
    </div>
    <button
      onClick={() => onViewChange('dashboard')}
      className="px-4 py-2 bg-brandPrimary text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
    >
      Return to Dashboard
    </button>
  </div>
);

// Main Wrapper providing Context Theme
export const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
