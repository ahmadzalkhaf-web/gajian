import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calculator,
  History,
  BarChart3,
  Settings,
  FileText,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogOut,
  UserCheck,
  Shield,
  X
} from 'lucide-react';
import { usePayroll, PageName } from '../context/PayrollContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
  const { activePage, setActivePage, isCloudConnected, isSyncing, fetchData, settings } = usePayroll();
  const { role, employee, setAdminRole, setShowLoginModal } = useAuth();

  const handleNavClick = (page: PageName) => {
    setActivePage(page);
    if (onMobileClose) onMobileClose();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
    { id: 'karyawan', label: 'Data Karyawan', icon: Users, adminOnly: true },
    { id: 'penggajian', label: 'Penggajian', icon: Calculator, adminOnly: true },
    { id: 'riwayat', label: 'Riwayat Gaji', icon: History, adminOnly: false },
    { id: 'laporan', label: 'Laporan', icon: BarChart3, adminOnly: true },
    { id: 'slip', label: 'Slip Gaji', icon: FileText, adminOnly: false, tag: 'Bebas Login' },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, adminOnly: true },
  ];

  const visibleItems = navItems.filter(item => {
    if (role === 'KARYAWAN') {
      return !item.adminOnly;
    }
    return true;
  });

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/20">
            {settings.logoPerusahaan || 'G'}
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none">GAJIKU</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Payroll Management</p>
          </div>
        </div>
        {isMobileOpen && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role / Profile Pill */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                role === 'ADMIN'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {role === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              {role === 'ADMIN' ? 'Admin' : 'Karyawan'}
            </span>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Ganti Role
          </button>
        </div>
        {role === 'KARYAWAN' && employee && (
          <p className="text-xs font-semibold text-slate-700 mt-2 truncate">
            {employee.nama} ({employee.id})
          </p>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => handleNavClick(item.id as PageName)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.tag && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Google Spreadsheet Status Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-amber-500 ring-2 ring-amber-100'}`} />
            <span className="text-slate-600 font-medium">Google Spreadsheet</span>
          </div>
          <button
            onClick={() => fetchData()}
            disabled={isSyncing}
            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
            title="Sinkronisasi Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] leading-tight text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium mb-1">
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span>{isCloudConnected ? 'Terkoneksi API' : 'Lokal / Apps Script'}</span>
          </div>
          <p className="truncate text-slate-400">
            {settings.namaPerusahaan || 'GAJIKU Payroll'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen fixed left-0 top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
