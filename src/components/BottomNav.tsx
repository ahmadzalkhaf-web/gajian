import React from 'react';
import { LayoutDashboard, Users, Calculator, History, Menu, FileText } from 'lucide-react';
import { usePayroll, PageName } from '../context/PayrollContext';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMobileMenu }) => {
  const { activePage, setActivePage } = usePayroll();
  const { role } = useAuth();

  const handleNav = (page: PageName) => {
    setActivePage(page);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 md:hidden flex items-center justify-around py-1.5 px-2 safe-area-pb shadow-lg">
      <button
        onClick={() => handleNav('dashboard')}
        className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
          activePage === 'dashboard' ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">Dashboard</span>
      </button>

      <button
        onClick={() => handleNav('penggajian')}
        className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
          activePage === 'penggajian' ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Calculator className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">Hitung</span>
      </button>

      {/* Slip Gaji Quick Center Action - Always available directly without login */}
      <button
        onClick={() => handleNav('slip')}
        className="flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all"
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center -mt-3 shadow-md transition-transform ${
          activePage === 'slip'
            ? 'bg-blue-600 text-white shadow-blue-500/40 scale-105'
            : 'bg-slate-900 text-white shadow-slate-900/30'
        }`}>
          <FileText className="w-4 h-4" />
        </div>
        <span className={`text-[10px] font-bold mt-0.5 ${
          activePage === 'slip' ? 'text-blue-600' : 'text-slate-700'
        }`}>
          Slip Gaji
        </span>
      </button>

      <button
        onClick={() => handleNav('riwayat')}
        className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
          activePage === 'riwayat' ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <History className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">Riwayat</span>
      </button>

      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center w-14 py-1 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">Menu</span>
      </button>
    </nav>
  );
};
