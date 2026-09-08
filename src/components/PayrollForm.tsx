import React, { useState, useEffect } from 'react';
import { Employee, PayrollRecord, TipeGaji, PayrollCalculationInput, PeriodItem } from '../types';
import { calculateSalary } from '../utils/salaryCalculator';
import { SalaryCalculation } from './SalaryCalculation';
import { Save, UserCheck, Calendar, Info, RefreshCw, Plus, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { usePayroll } from '../context/PayrollContext';
import { ModalTambahPeriode } from './ModalTambahPeriode';

interface PayrollFormProps {
  employees: Employee[];
  initialRecord?: PayrollRecord | null;
  activePeriode: string;
  onSave: (data: Omit<PayrollRecord, 'id' | 'tanggalDibuat'>) => Promise<void>;
  onSuccess?: () => void;
}

export const PayrollForm: React.FC<PayrollFormProps> = ({
  employees,
  initialRecord,
  activePeriode,
  onSave,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { periods } = usePayroll();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    initialRecord?.employeeId || (employees[0]?.id || '')
  );
  const [tipeGaji, setTipeGaji] = useState<TipeGaji>(
    initialRecord?.tipeGaji || 'Harian'
  );
  const [periode, setPeriode] = useState<string>(
    initialRecord?.periode || activePeriode
  );

  useEffect(() => {
    if (!initialRecord && activePeriode) {
      setPeriode(activePeriode);
    }
  }, [activePeriode, initialRecord]);

  // Form Inputs
  const [hadir, setHadir] = useState<number | string>(initialRecord?.hadir ?? 6);
  const [gajiPokok, setGajiPokok] = useState<number | string>(initialRecord?.gajiPokok ?? 100000);
  const [lembur, setLembur] = useState<number | string>(initialRecord?.lembur ?? 0);
  const [bonusKoor1, setBonusKoor1] = useState<number | string>(initialRecord?.bonusKoor1 ?? 0);
  const [bonusKoor2, setBonusKoor2] = useState<number | string>(initialRecord?.bonusKoor2 ?? 0);
  const [bonus1, setBonus1] = useState<number | string>(initialRecord?.bonus1 ?? 0);
  const [bonus2, setBonus2] = useState<number | string>(initialRecord?.bonus2 ?? 0);
  const [bonus3, setBonus3] = useState<number | string>(initialRecord?.bonus3 ?? 0);
  const [telat, setTelat] = useState<number | string>(initialRecord?.telat ?? 0);
  const [gajiDiambil, setGajiDiambil] = useState<number | string>(initialRecord?.gajiDiambil ?? 0);
  const [keterangan, setKeterangan] = useState<string>(initialRecord?.keterangan ?? '');
  const [komentar, setKomentar] = useState<string>(initialRecord?.komentar ?? '');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // When selected employee changes, update auto values
  const currentEmp = employees.find((e) => e.id === selectedEmpId);

  useEffect(() => {
    if (initialRecord) {
      setSelectedEmpId(initialRecord.employeeId);
      setTipeGaji(initialRecord.tipeGaji);
      setPeriode(initialRecord.periode);
      setHadir(initialRecord.hadir);
      setGajiPokok(initialRecord.gajiPokok);
      setLembur(initialRecord.lembur);
      setBonusKoor1(initialRecord.bonusKoor1);
      setBonusKoor2(initialRecord.bonusKoor2);
      setBonus1(initialRecord.bonus1);
      setBonus2(initialRecord.bonus2);
      setBonus3(initialRecord.bonus3);
      setTelat(initialRecord.telat);
      setGajiDiambil(initialRecord.gajiDiambil);
      setKeterangan(initialRecord.keterangan || '');
    }
  }, [initialRecord]);

  // Realtime calculation
  const calcInput: PayrollCalculationInput = {
    tipeGaji,
    hadir: Number(hadir) || 0,
    gajiPokok: Number(gajiPokok) || 0,
    lembur: Number(lembur) || 0,
    bonusKoor1: Number(bonusKoor1) || 0,
    bonusKoor2: Number(bonusKoor2) || 0,
    bonus1: Number(bonus1) || 0,
    bonus2: Number(bonus2) || 0,
    bonus3: Number(bonus3) || 0,
    telat: Number(telat) || 0,
    gajiDiambil: Number(gajiDiambil) || 0,
  };

  const calculationResult = calculateSalary(calcInput);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) {
      showToast('Karyawan Belum Dipilih', 'Silakan pilih karyawan terlebih dahulu', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        employeeId: currentEmp.id,
        nama: currentEmp.nama,
        tipeGaji,
        divisi: currentEmp.divisi || 'Apparel',
        hadir: Number(hadir) || 0,
        gajiPokok: Number(gajiPokok) || 0,
        lembur: Number(lembur) || 0,
        bonusKoor1: Number(bonusKoor1) || 0,
        bonusKoor2: Number(bonusKoor2) || 0,
        bonus1: Number(bonus1) || 0,
        bonus2: Number(bonus2) || 0,
        bonus3: Number(bonus3) || 0,
        telat: Number(telat) || 0,
        gajiDiambil: Number(gajiDiambil) || 0,
        total: calculationResult.total,
        keterangan: keterangan.trim(),
        komentar: komentar.trim(),
        periode: periode.trim(),
      });

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast('Gagal Menyimpan Penggajian', errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Kolom Kiri: Form Input Data */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">FORM PENGGAJIAN</h3>
            <p className="text-xs text-slate-500 mt-0.5">Input data kehadiran dan tunjangan karyawan</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Google Spreadsheet Sync
          </span>
        </div>

        {/* Periode Penggajian */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>PERIODE PENGGAJIAN</span>
            </label>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md shadow-2xs transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>+ Tambah Periode Sheet Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <select
                value={periods.some((p) => p.nama === periode) ? periode : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    setPeriode(e.target.value);
                  }
                }}
                className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-xs font-semibold focus:border-[#2563EB] outline-none"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.nama}>
                    {p.nama} {p.sheetTabName ? `(${p.sheetTabName})` : ''}
                  </option>
                ))}
                <option value="custom">-- Ketik / Nama Periode Lainnya --</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                required
                placeholder="Contoh: September 2026 Minggu 1"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-xs font-semibold focus:border-[#2563EB] outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Setiap periode otomatis dibuatkan Tab Sheet di Google Spreadsheet lengkap dengan formula dan kolom perhitungan.
          </p>
        </div>

        {/* Pilih Karyawan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Pilih Karyawan <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm font-medium focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nama} ({emp.id}) • [{emp.divisi || 'Apparel'}] - {emp.jabatan || 'Karyawan'}
                </option>
              ))}
            </select>
            {currentEmp && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                <span>Divisi: <strong className="text-slate-800">{currentEmp.divisi || 'Apparel'}</strong></span>
                <span>•</span>
                <span>Jabatan: <strong className="text-slate-800">{currentEmp.jabatan || '-'}</strong></span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tipe Gaji <span className="text-rose-500">*</span>
            </label>
            <select
              value={tipeGaji}
              onChange={(e) => setTipeGaji(e.target.value as TipeGaji)}
              className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm font-medium focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="Harian">Harian</option>
              <option value="Borongan">Borongan</option>
            </select>
          </div>
        </div>

        {/* Gaji Pokok & Hadir / Lembur */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {tipeGaji === 'Harian' ? 'Hadir (Hari)' : 'Unit / Kehadiran'}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={hadir}
              onChange={(e) => setHadir(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Gaji Pokok (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={gajiPokok}
              onChange={(e) => setGajiPokok(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm font-semibold focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {tipeGaji === 'Harian' ? 'Lembur (Jam / Hari)' : 'Nominal Lembur (Rp)'}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={lembur}
              onChange={(e) => setLembur(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        {/* Bonus Section */}
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
            <span>Rincian Bonus (Rp)</span>
            <span className="text-[11px] font-normal text-slate-400">Diisi jika ada</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Bonus Koor 1</label>
              <input
                type="number"
                min="0"
                step="500"
                value={bonusKoor1}
                onChange={(e) => setBonusKoor1(e.target.value)}
                className="w-full h-10 px-3 rounded-[10px] bg-white border border-slate-300 text-slate-800 text-xs focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Bonus Koor 2</label>
              <input
                type="number"
                min="0"
                step="500"
                disabled={tipeGaji === 'Borongan'}
                value={bonusKoor2}
                onChange={(e) => setBonusKoor2(e.target.value)}
                className={`w-full h-10 px-3 rounded-[10px] border text-xs outline-none ${
                  tipeGaji === 'Borongan'
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Bonus 1</label>
              <input
                type="number"
                min="0"
                step="500"
                disabled={tipeGaji === 'Borongan'}
                value={bonus1}
                onChange={(e) => setBonus1(e.target.value)}
                className={`w-full h-10 px-3 rounded-[10px] border text-xs outline-none ${
                  tipeGaji === 'Borongan'
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Bonus 2</label>
              <input
                type="number"
                min="0"
                step="500"
                disabled={tipeGaji === 'Borongan'}
                value={bonus2}
                onChange={(e) => setBonus2(e.target.value)}
                className={`w-full h-10 px-3 rounded-[10px] border text-xs outline-none ${
                  tipeGaji === 'Borongan'
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Bonus 3</label>
              <input
                type="number"
                min="0"
                step="500"
                disabled={tipeGaji === 'Borongan'}
                value={bonus3}
                onChange={(e) => setBonus3(e.target.value)}
                className={`w-full h-10 px-3 rounded-[10px] border text-xs outline-none ${
                  tipeGaji === 'Borongan'
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Potongan Section (Untuk Harian) */}
        {tipeGaji === 'Harian' && (
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Potongan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Telat (Jumlah Kejadian)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={telat}
                    onChange={(e) => setTelat(e.target.value)}
                    className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    × Rp 5
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Potongan = {Number(telat) || 0} × 5</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Gaji Diambil (Dalam 1 Minggu)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Rp 0"
                  value={gajiDiambil}
                  onChange={(e) => setGajiDiambil(e.target.value)}
                  className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Kasbon / pengambilan uang muka</p>
              </div>
            </div>
          </div>
        )}

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Keterangan / Catatan
          </label>
          <input
            type="text"
            placeholder="Contoh: Lembur proyek ekspor batch 1"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Kolom Komentar (Muncul di Spreadsheet & Slip) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-600">
              Kolom Komentar / Catatan Tambahan (Muncul di Spreadsheet & Slip)
            </label>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
              Kolom Spreadsheet Baru
            </span>
          </div>
          <textarea
            rows={2}
            placeholder="Tuliskan komentar atau catatan untuk slip ini (misal: Evaluasi performa minggu ini sangat baik, ada bonus target)"
            value={komentar}
            onChange={(e) => setKomentar(e.target.value)}
            className="w-full p-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400 resize-y"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-base font-semibold shadow-xs hover:shadow transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Menyimpan ke Google Sheet...' : 'Simpan Data Penggajian'}</span>
          </button>
        </div>
      </div>

      {/* Kolom Kanan: Card Kalkulasi Realtime */}
      <div className="lg:col-span-5">
        <SalaryCalculation
          calculation={calculationResult}
          tipeGaji={tipeGaji}
          employeeName={currentEmp?.nama}
          periode={periode}
        />
      </div>

      {/* Modal Tambah Periode Baru ke Spreadsheet */}
      <ModalTambahPeriode
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newP) => {
          setPeriode(newP.nama);
        }}
      />
    </form>
  );
};
