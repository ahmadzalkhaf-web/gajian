import React from 'react';
import { Menu, Bell, RefreshCw, ChevronRight, UserCheck, Shield, FileText } from 'lucide-react';
import { usePayroll, PageName } from '../context/PayrollContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { activePage, setActivePage, isSyncing, fetchData, settings } = usePayroll();
  const { role, employee, setShowLoginModal } = useAuth();

  const getPageTitle = (page: PageName): string => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard Penggajian';
      case 'karyawan':
        return 'Data Karyawan';
      case 'penggajian':
        return 'Form Penggajian';
      case 'riwayat':
        return 'Riwayat Penggajian';
      case 'laporan':
        return 'Laporan & Statistik';
      case 'slip':
        return 'Slip Gaji Karyawan';
      case 'pengaturan':
        return 'Pengaturan & Integrasi';
      default:
        return 'GAJIKU';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-none"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 mb-0.5">
            <span>GAJIKU</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="capitalize font-medium text-slate-600">{activePage}</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-none">
            {getPageTitle(activePage)}
          </h2>
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Direct Slip Access Button */}
        <button
          onClick={() => setActivePage('slip')}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activePage === 'slip'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
          title="Buka Portal Slip Gaji (Bisa diakses langsung tanpa login)"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Lihat Slip Gaji</span>
        </button>

        {/* Sync Button */}
        <button
          onClick={() => fetchData()}
          disabled={isSyncing}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Sinkronisasi dengan Google Spreadsheet"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Sheet'}</span>
        </button>

        {/* Notifications Mock / Indicator */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
          </button>
        </div>

        {/* Active Role Avatar pill */}
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors bg-white shadow-2xs"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
            role === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {role === 'ADMIN' ? 'AD' : (employee?.nama.substring(0, 2).toUpperCase() || 'KR')}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {role === 'ADMIN' ? (settings.namaAdmin || 'Admin Payroll') : (employee?.nama || 'Karyawan')}
            </p>
            <p className="text-[11px] text-slate-600 capitalize">
              {role === 'ADMIN' ? 'Admin' : (employee?.jabatan || 'Karyawan')}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};
