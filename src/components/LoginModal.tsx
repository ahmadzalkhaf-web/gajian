import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePayroll } from '../context/PayrollContext';
import { Shield, UserCheck, Key, X, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const LoginModal: React.FC = () => {
  const { role, employee, setAdminRole, setEmployeeRole, showLoginModal, setShowLoginModal } = useAuth();
  const { employees, openSlipForEmployee } = usePayroll();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'KARYAWAN'>(role);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employee?.id || (employees[0]?.id || ''));
  const [inputToken, setInputToken] = useState<string>('');

  if (!showLoginModal) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'ADMIN') {
      setAdminRole();
      showToast('Login Berhasil', 'Masuk sebagai Administrator', 'success');
      setShowLoginModal(false);
    } else {
      let targetEmp = employees.find(e => e.id === selectedEmpId);
      if (inputToken.trim()) {
        const foundByToken = employees.find(e => e.tokenAkses.toLowerCase() === inputToken.trim().toLowerCase());
        if (foundByToken) targetEmp = foundByToken;
      }

      if (targetEmp) {
        setEmployeeRole(targetEmp);
        openSlipForEmployee(targetEmp);
        showToast('Login Karyawan Berhasil', `Masuk sebagai ${targetEmp.nama}`, 'success');
        setShowLoginModal(false);
      } else {
        showToast('Karyawan Tidak Ditemukan', 'Token atau data karyawan tidak valid', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Sistem Akses & Role</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pilih role untuk mengatur hak akses aplikasi</p>
          </div>
          <button
            onClick={() => setShowLoginModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('ADMIN')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedRole === 'ADMIN'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2">
                <Shield className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-slate-800">ADMIN</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Kelola karyawan & penggajian penuh</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('KARYAWAN')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedRole === 'KARYAWAN'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-100'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2">
                <UserCheck className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-slate-800">KARYAWAN</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Akses slip gaji & riwayat pribadi</p>
            </button>
          </div>

          {selectedRole === 'KARYAWAN' && (
            <div className="space-y-3 pt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Akun Karyawan
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full h-10 px-3 rounded-[10px] bg-white border border-slate-300 text-xs font-medium text-slate-800 outline-none focus:border-blue-600"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nama} ({emp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atau Masukkan Token Slip Unik
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: SLIP-X8K29M"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-white border border-slate-300 text-xs text-slate-800 outline-none focus:border-blue-600 uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="px-4 py-2 rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <span>Terapkan Role</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
