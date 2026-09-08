import React, { useState, useEffect } from 'react';
import { PeriodItem } from '../types';
import {
  X,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';
import { usePayroll } from '../context/PayrollContext';

interface ModalTambahPeriodeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (period: PeriodItem) => void;
}

const BULAN_LIST = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const BULAN_SHORT: Record<string, string> = {
  Januari: 'Jan',
  Februari: 'Feb',
  Maret: 'Mar',
  April: 'Apr',
  Mei: 'Mei',
  Juni: 'Jun',
  Juli: 'Jul',
  Agustus: 'Ags',
  September: 'Sep',
  Oktober: 'Okt',
  November: 'Nov',
  Desember: 'Des',
};

export const ModalTambahPeriode: React.FC<ModalTambahPeriodeProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addPeriod, employees, isCloudConnected } = usePayroll();

  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonthIdx = now.getMonth();
  const currentMonthName = BULAN_LIST[currentMonthIdx] || 'September';

  // Form states
  const [tipe, setTipe] = useState<'Mingguan' | 'Bulanan'>('Mingguan');
  const [bulan, setBulan] = useState<string>(currentMonthName);
  const [tahun, setTahun] = useState<string>(currentYear);
  const [mingguKe, setMingguKe] = useState<number>(2);

  // Custom overrides (optional)
  const [namaPeriode, setNamaPeriode] = useState<string>('');
  const [namaSheetTab, setNamaSheetTab] = useState<string>('');
  const [isCustomNama, setIsCustomNama] = useState<boolean>(false);

  // Automation flags
  const [autoPopulateEmployees, setAutoPopulateEmployees] = useState<boolean>(true);
  const [setAsActive, setSetAsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeEmployeesCount = employees.filter((e) => e.status !== 'Nonaktif').length;

  // Auto-generate name based on inputs
  useEffect(() => {
    if (!isCustomNama) {
      if (tipe === 'Mingguan') {
        const generatedName = `${bulan} ${tahun} Minggu ${mingguKe}`;
        const shortBulan = BULAN_SHORT[bulan] || bulan.substring(0, 3);
        const generatedSheet = `GAJI_${shortBulan}_${tahun}_M${mingguKe}`;
        setNamaPeriode(generatedName);
        setNamaSheetTab(generatedSheet);
      } else {
        const generatedName = `${bulan} ${tahun}`;
        const shortBulan = BULAN_SHORT[bulan] || bulan.substring(0, 3);
        const generatedSheet = `GAJI_${shortBulan}_${tahun}`;
        setNamaPeriode(generatedName);
        setNamaSheetTab(generatedSheet);
      }
    }
  }, [tipe, bulan, tahun, mingguKe, isCustomNama]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPeriode.trim()) return;

    setIsSubmitting(true);
    try {
      const sanitizedSheet = (namaSheetTab.trim() || `GAJI_${namaPeriode.replace(/[^a-zA-Z0-9]/g, '_')}`).substring(0, 30);
      
      const newPeriodData: Omit<PeriodItem, 'id' | 'tanggalDibuat'> = {
        nama: namaPeriode.trim(),
        tipe,
        bulan,
        tahun,
        mingguKe: tipe === 'Mingguan' ? mingguKe : undefined,
        sheetTabName: sanitizedSheet,
        status: 'Aktif',
      };

      await addPeriod(newPeriodData, autoPopulateEmployees, setAsActive);

      if (onSuccess) {
        onSuccess({
          ...newPeriodData,
          id: `PER-${Date.now()}`,
          tanggalDibuat: new Date().toISOString().split('T')[0],
        });
      }

      onClose();
    } catch (err) {
      console.error('Error saat menambah periode:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-[20px] max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-auto text-slate-800 transition-all max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                Tambah Periode Baru
              </h3>
              <p className="text-xs text-slate-500">
                Otomatis buat Tab Sheet, kolom lengkap, dan formula di Google Spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1">
          {/* Tipe Periode Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Jenis Periode Penggajian
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setTipe('Mingguan');
                  setIsCustomNama(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  tipe === 'Mingguan'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Mingguan (Weekly)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipe('Bulanan');
                  setIsCustomNama(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  tipe === 'Bulanan'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Bulanan (Monthly)</span>
              </button>
            </div>
          </div>

          {/* Preset Selector: Bulan, Tahun, Minggu Ke */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Bulan</label>
              <select
                value={bulan}
                onChange={(e) => {
                  setBulan(e.target.value);
                  setIsCustomNama(false);
                }}
                className="w-full h-10 px-3 rounded-[10px] bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:bg-white focus:border-blue-600 outline-none"
              >
                {BULAN_LIST.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun</label>
              <select
                value={tahun}
                onChange={(e) => {
                  setTahun(e.target.value);
                  setIsCustomNama(false);
                }}
                className="w-full h-10 px-3 rounded-[10px] bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:bg-white focus:border-blue-600 outline-none"
              >
                {['2024', '2025', '2026', '2027', '2028'].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {tipe === 'Mingguan' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Minggu Ke-
                </label>
                <select
                  value={mingguKe}
                  onChange={(e) => {
                    setMingguKe(Number(e.target.value));
                    setIsCustomNama(false);
                  }}
                  className="w-full h-10 px-3 rounded-[10px] bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:bg-white focus:border-blue-600 outline-none"
                >
                  <option value={1}>Minggu 1 (M1)</option>
                  <option value={2}>Minggu 2 (M2)</option>
                  <option value={3}>Minggu 3 (M3)</option>
                  <option value={4}>Minggu 4 (M4)</option>
                  <option value={5}>Minggu 5 (M5)</option>
                </select>
              </div>
            )}
          </div>

          {/* Generated Name & Tab Sheet Name */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600">
                  Nama Label Periode
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomNama(!isCustomNama)}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  {isCustomNama ? 'Gunakan Auto-generate' : 'Ubah Manual / Custom'}
                </button>
              </div>
              <input
                type="text"
                required
                value={namaPeriode}
                onChange={(e) => {
                  setIsCustomNama(true);
                  setNamaPeriode(e.target.value);
                }}
                placeholder="Contoh: September 2026 Minggu 2"
                className="w-full h-10 px-3.5 rounded-[10px] bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Tab Sheet Baru di Google Spreadsheet
              </label>
              <div className="relative">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={namaSheetTab}
                  onChange={(e) => {
                    setIsCustomNama(true);
                    setNamaSheetTab(e.target.value);
                  }}
                  placeholder="Contoh: GAJI_Sep_2026_M2"
                  className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono font-bold focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tab sheet baru dengan nama ini akan langsung dibuat otomatis di file Google Spreadsheet Anda.
              </p>
            </div>
          </div>

          {/* Automation Checkboxes */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 pb-1 border-b border-blue-100/60">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Otomatisasi Google Spreadsheet:</span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPopulateEmployees}
                onChange={(e) => setAutoPopulateEmployees(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs text-slate-700">
                <strong>Salin {activeEmployeesCount} Data Karyawan Aktif</strong> ke sheet periode baru dengan formula otomatis Total Gaji.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={setAsActive}
                onChange={(e) => setSetAsActive(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs text-slate-700">
                <strong>Jadikan Periode Penggajian Aktif Sekarang</strong> (otomatis terpilih di form Input Gaji & Dashboard).
              </span>
            </label>
          </div>

          {/* Preview Sheet Structure Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Struktur Sheet Otomatis:
              </span>
              <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-600">
                17 Kolom Lengkap
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Kolom: <span className="font-mono text-slate-700">ID, Nama, Jabatan, Tipe Gaji, Hadir, Gaji Pokok, Lembur, Bonus Koor 1-2, Bonus 1-3, Telat, Gaji Diambil, Total Gaji, Keterangan, Link Slip</span>
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              ✓ Header Biru Berani (#1E40AF), Freeze Baris 1, dan Rumus Excel/Sheets Siap Pakai.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-[10px] border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !namaPeriode.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Membuat Sheet di Spreadsheet...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Buat Periode & Tambahkan Sheet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
