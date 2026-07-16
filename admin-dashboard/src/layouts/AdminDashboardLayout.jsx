import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';

export const AdminDashboardLayout = ({ children, activeView, onLogout, selectedRole, setSelectedRole }) => {
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [activeView]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA] dark:bg-[#0B1120] text-slate-800 dark:text-white transition-colors duration-305">
      <Sidebar
        activeView={activeView}
        onLogout={onLogout}
        isOpenMobile={isOpenMobileMenu}
        setIsOpenMobile={setIsOpenMobileMenu}
        role={selectedRole}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeView={activeView}
          onOpenMobileMenu={() => setIsOpenMobileMenu(true)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main className="flex-1 p-6 overflow-y-auto relative no-scrollbar">
          <div className="aurora-bg absolute inset-0 pointer-events-none z-0" />
          <div className="relative z-10 pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
