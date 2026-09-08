import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { PayrollForm } from '../components/PayrollForm';
import { EmptyState } from '../components/EmptyState';
import { FormSkeleton } from '../components/LoadingSkeleton';
import { ModalTambahPeriode } from '../components/ModalTambahPeriode';
import { Users, Plus, FileSpreadsheet, Calendar, Check } from 'lucide-react';

export const PenggajianPage: React.FC = () => {
  const { employees, settings, periods, setActivePeriode, isLoading, addPayroll, setActivePage } = usePayroll();
  const [isModalPeriodeOpen, setIsModalPeriodeOpen] = useState(false);

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Belum Ada Data Karyawan"
        description="Silakan tambahkan data karyawan terlebih dahulu sebelum membuat perhitungan dan slip gaji."
        actionText="+ Tambah Karyawan Pertama"
        onAction={() => setActivePage('karyawan')}
      />
    );
  }

  const currentPeriode = settings.periodeAktif || 'September 2026 Minggu 1';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-[16px] border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Input & Hitung Penggajian
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Calendar className="w-3 h-3 text-blue-600" />
              {currentPeriode}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih karyawan, isi komponen kehadiran, dan simpan langsung ke Google Spreadsheet
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Period Selector if multiple periods */}
          {periods && periods.length > 0 && (
            <select
              value={currentPeriode}
              onChange={(e) => setActivePeriode(e.target.value)}
              className="h-10 px-3 rounded-[10px] bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 outline-none transition-colors"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.nama}>
                  {p.nama}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsModalPeriodeOpen(true)}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Tambah Periode Sheet</span>
          </button>
        </div>
      </div>

      <PayrollForm
        employees={employees}
        activePeriode={currentPeriode}
        onSave={async (data) => {
          await addPayroll(data);
          setActivePage('riwayat');
        }}
      />

      {/* Modal Tambah Periode Baru */}
      <ModalTambahPeriode
        isOpen={isModalPeriodeOpen}
        onClose={() => setIsModalPeriodeOpen(false)}
      />
    </div>
  );
};

