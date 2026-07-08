import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { Footer } from '../components/Footer';

export const AdminDashboardLayout = ({ children, activeView, onLogout, selectedRole, setSelectedRole }) => {
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);

  return (
    <div className="flex min-h-screen bg-darkBg dark:bg-darkBg light:bg-lightBg text-white dark:text-white light:text-black transition-colors duration-300">
      <Sidebar
        activeView={activeView}
        onLogout={onLogout}
        isOpenMobile={isOpenMobileMenu}
        setIsOpenMobile={setIsOpenMobileMenu}
        role={selectedRole}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeView={activeView}
          onOpenMobileMenu={() => setIsOpenMobileMenu(true)}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
        />
        <div className="px-6 pt-4">
          <Breadcrumb activeView={activeView} />
        </div>
        <main className="flex-1 p-6 overflow-y-auto aurora-bg">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
