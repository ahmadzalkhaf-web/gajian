import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PayrollProvider, usePayroll, PageName } from './context/PayrollContext';
import { ToastContainer } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginModal } from './components/LoginModal';

import { Dashboard } from './pages/Dashboard';
import { KaryawanPage } from './pages/Karyawan';
import { PenggajianPage } from './pages/Penggajian';
import { RiwayatPage } from './pages/Riwayat';
import { LaporanPage } from './pages/Laporan';
import { SlipPage } from './pages/SlipPage';
import { PengaturanPage } from './pages/Pengaturan';

const AppContent: React.FC = () => {
  const { activePage, setActivePage, employees, openSlipForEmployee } = usePayroll();
  const { role, setEmployeeRole } = useAuth();
  const { showToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check for URL parameters like ?slip=TOKEN or ?emp=ID or path hash
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const slipToken =
      urlParams.get('slip') ||
      urlParams.get('emp') ||
      urlParams.get('id') ||
      (window.location.hash.includes('/slip') ? window.location.hash.replace('#/slip/', '').replace('#', '') : null);

    if (slipToken && employees.length > 0) {
      const cleanToken = decodeURIComponent(slipToken).trim().toLowerCase();
      const matched = employees.find(
        (e) =>
          e.tokenAkses.toLowerCase() === cleanToken ||
          e.id.toLowerCase() === cleanToken ||
          e.nama.toLowerCase() === cleanToken ||
          (e.noWhatsapp && cleanToken.length > 5 && e.noWhatsapp.replace(/[^0-9]/g, '').includes(cleanToken.replace(/[^0-9]/g, '')))
      );
      if (matched) {
        setEmployeeRole(matched);
        openSlipForEmployee(matched);
        setActivePage('slip');
        showToast('Slip Gaji Terbuka', `Menampilkan slip gaji untuk ${matched.nama} tanpa login.`, 'info');
      }
    }
  }, [employees]);

  // Render current active page
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'karyawan':
        return <KaryawanPage />;
      case 'penggajian':
        return <PenggajianPage />;
      case 'riwayat':
        return <RiwayatPage />;
      case 'laporan':
        return <LaporanPage />;
      case 'slip':
        return <SlipPage />;
      case 'pengaturan':
        return <PengaturanPage />;
      default:
        return <Dashboard />;
    }
  };

  // Tampilan murni detail slip saja tanpa layout menu dll saat activePage === 'slip'
  if (activePage === 'slip') {
    return (
      <div className="min-h-screen bg-slate-100/70 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900 py-6 px-3 sm:px-6">
        <main className="max-w-3xl mx-auto">
          <SlipPage />
        </main>
        <LoginModal />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {renderPage()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Role / Login Modal */}
      <LoginModal />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PayrollProvider>
          <AppContent />
        </PayrollProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
