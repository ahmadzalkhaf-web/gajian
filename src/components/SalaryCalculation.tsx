import React from 'react';
import { PayrollCalculationResult, TipeGaji } from '../types';
import { formatRupiah } from '../utils/formatCurrency';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';

interface SalaryCalculationProps {
  calculation: PayrollCalculationResult;
  tipeGaji: TipeGaji;
  employeeName?: string;
  periode?: string;
}

export const SalaryCalculation: React.FC<SalaryCalculationProps> = ({
  calculation,
  tipeGaji,
  employeeName,
  periode,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs sticky top-24">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">RINCIAN GAJI</h3>
            <p className="text-xs text-slate-600 mt-0.5">Kalkulasi Otomatis Realtime</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          tipeGaji === 'Harian' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {tipeGaji}
        </span>
      </div>

      {employeeName && (
        <div className="py-3 px-3.5 mt-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-600">Karyawan Penerima</p>
          <p className="text-sm font-bold text-slate-800">{employeeName}</p>
          {periode && <p className="text-xs text-blue-600 font-medium mt-0.5">{periode}</p>}
        </div>
      )}

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Gaji Utama</span>
          <span className="font-semibold text-slate-800">{formatRupiah(calculation.gajiUtama)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600">Lembur</span>
          <span className="font-semibold text-slate-800">{formatRupiah(calculation.lemburNominal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600">Total Bonus</span>
          <span className="font-semibold text-emerald-600">+{formatRupiah(calculation.totalBonus)}</span>
        </div>

        {tipeGaji === 'Harian' && (
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total Potongan</span>
            <span className="font-semibold text-rose-600">
              {calculation.totalPotongan > 0 ? `-${formatRupiah(calculation.totalPotongan)}` : 'Rp 0'}
            </span>
          </div>
        )}

        {tipeGaji === 'Harian' && calculation.totalPotongan > 0 && (
          <div className="pl-3 border-l-2 border-slate-200 text-xs text-slate-600 space-y-1 pt-1">
            <div className="flex justify-between">
              <span>Potongan Telat (Telat × Rp 5)</span>
              <span>{formatRupiah(calculation.breakdown.potonganTelat)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gaji Diambil (1 Minggu)</span>
              <span>{formatRupiah(calculation.breakdown.potonganGajiDiambil)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="my-5 border-t border-slate-200" />

      {/* TOTAL GAJI Highlight Box */}
      <div className="rounded-xl p-4 bg-[#EFF6FF] border border-blue-200/80 text-center">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          TOTAL DITERIMA
        </p>
        <p className="text-2xl md:text-3xl font-extrabold text-[#2563EB] mt-1 tracking-tight">
          {formatRupiah(calculation.total)}
        </p>
        <p className="text-[11px] text-blue-600/80 mt-1">
          {tipeGaji === 'Harian'
            ? 'Rumus: (Hadir×GP) + (Lembur×GP) + Bonus - (Telat×5) - Diambil'
            : 'Rumus: Gaji Pokok + Lembur + Bonus Koor 1'}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Sesuai formula Google Spreadsheet aktif</span>
      </div>
    </div>
  );
};
