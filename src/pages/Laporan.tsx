import React, { useState, useMemo } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatRupiah } from '../utils/formatCurrency';
import { exportToExcel } from '../services/exportService';
import { DAFTAR_DIVISI, DivisiKaryawan } from '../types';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Download,
  Printer,
  DollarSign,
  Calendar,
  Filter,
  Users,
  Award,
  Layers,
  Wallet,
  ArrowDownRight,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DivisiStatItem {
  divisi: DivisiKaryawan;
  recordsCount: number;
  employeeCount: number;
  totalGaji: number;
  totalDiambil: number;
  totalKotor: number;
  rataRata: number;
  persenDariTotal: number;
  persenDiambil: number;
}

const DIVISI_THEMES: Record<
  DivisiKaryawan,
  {
    bg: string;
    text: string;
    border: string;
    bar: string;
    lightBg: string;
  }
> = {
  Apparel: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    bar: 'bg-blue-600',
    lightBg: 'bg-blue-100',
  },
  Distro: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    bar: 'bg-violet-600',
    lightBg: 'bg-violet-100',
  },
  Jersey: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    bar: 'bg-emerald-600',
    lightBg: 'bg-emerald-100',
  },
  Hijab: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    bar: 'bg-rose-600',
    lightBg: 'bg-rose-100',
  },
  Scarf: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    bar: 'bg-amber-600',
    lightBg: 'bg-amber-100',
  },
};

export const LaporanPage: React.FC = () => {
  const { payrollRecords, employees } = usePayroll();
  const { showToast } = useToast();

  const [filterPeriode, setFilterPeriode] = useState('Semua');
  const [filterDivisi, setFilterDivisi] = useState('Semua');
  const [filterTipeGaji, setFilterTipeGaji] = useState('Semua');

  // Unique periods
  const uniquePeriods = useMemo(() => {
    return Array.from(new Set(payrollRecords.map((p) => p.periode).filter(Boolean)));
  }, [payrollRecords]);

  // Filtered dataset according to period and wage type (and optionally division)
  const filteredData = useMemo(() => {
    return payrollRecords.filter((p) => {
      const matchPeriod = filterPeriode === 'Semua' || p.periode === filterPeriode;
      const matchTipe = filterTipeGaji === 'Semua' || p.tipeGaji === filterTipeGaji;
      
      const empDivisi = p.divisi || employees.find((e) => e.id === p.employeeId)?.divisi || 'Apparel';
      const matchDivisi = filterDivisi === 'Semua' || empDivisi.toLowerCase() === filterDivisi.toLowerCase();

      return matchPeriod && matchTipe && matchDivisi;
    });
  }, [payrollRecords, filterPeriode, filterTipeGaji, filterDivisi, employees]);

  // Overall Statistics for the active filters
  const totalPengeluaran = filteredData.reduce((sum, p) => sum + p.total, 0);
  const totalDiambilSemua = filteredData.reduce((sum, p) => sum + (p.gajiDiambil || 0), 0);
  const totalKotorSemua = filteredData.reduce((sum, p) => sum + p.total + (p.gajiDiambil || 0), 0);
  const rataRataGaji = filteredData.length > 0 ? Math.round(totalPengeluaran / filteredData.length) : 0;

  // Breakdown of components
  const totalGajiPokok = filteredData.reduce((sum, p) => {
    if (p.tipeGaji === 'Harian') {
      return sum + p.hadir * p.gajiPokok;
    }
    return sum + p.gajiPokok;
  }, 0);

  const totalLembur = filteredData.reduce((sum, p) => {
    if (p.tipeGaji === 'Harian') {
      return sum + p.lembur * p.gajiPokok;
    }
    return sum + p.lembur;
  }, 0);

  const totalBonus = filteredData.reduce(
    (sum, p) => sum + p.bonusKoor1 + p.bonusKoor2 + p.bonus1 + p.bonus2 + p.bonus3,
    0
  );

  const totalPotongan = filteredData.reduce(
    (sum, p) => sum + p.telat * 5 + p.gajiDiambil,
    0
  );

  // Statistics per Division (Calculated on active period and wage type to provide accurate comparison)
  const periodFilteredData = useMemo(() => {
    return payrollRecords.filter((p) => {
      const matchPeriod = filterPeriode === 'Semua' || p.periode === filterPeriode;
      const matchTipe = filterTipeGaji === 'Semua' || p.tipeGaji === filterTipeGaji;
      return matchPeriod && matchTipe;
    });
  }, [payrollRecords, filterPeriode, filterTipeGaji]);

  const totalBebanSemuaDivisi = periodFilteredData.reduce((sum, p) => sum + p.total, 0) || 1;
  const totalDiambilKeseluruhan = periodFilteredData.reduce((sum, p) => sum + (p.gajiDiambil || 0), 0);
  const totalKotorKeseluruhan = periodFilteredData.reduce((sum, p) => sum + p.total + (p.gajiDiambil || 0), 0);

  const divisiStats: DivisiStatItem[] = useMemo(() => {
    return DAFTAR_DIVISI.map((divisiName) => {
      const records = periodFilteredData.filter((p) => {
        const empDivisi = p.divisi || employees.find((e) => e.id === p.employeeId)?.divisi || 'Apparel';
        return empDivisi.toLowerCase() === divisiName.toLowerCase();
      });

      const totalGaji = records.reduce((sum, p) => sum + p.total, 0);
      const totalDiambil = records.reduce((sum, p) => sum + (p.gajiDiambil || 0), 0);
      const totalKotor = totalGaji + totalDiambil;
      const employeeIds = new Set(records.map((r) => r.employeeId));
      const employeeCount = employeeIds.size;
      const recordsCount = records.length;
      const rataRata = recordsCount > 0 ? Math.round(totalGaji / recordsCount) : 0;
      const persenDariTotal = Math.round((totalGaji / totalBebanSemuaDivisi) * 100);
      const persenDiambil = totalKotor > 0 ? Math.round((totalDiambil / totalKotor) * 100) : 0;

      return {
        divisi: divisiName,
        recordsCount,
        employeeCount,
        totalGaji,
        totalDiambil,
        totalKotor,
        rataRata,
        persenDariTotal,
        persenDiambil,
      };
    });
  }, [periodFilteredData, employees, totalBebanSemuaDivisi]);

  // Group by Period for Bar Chart
  const periodMap = new Map<string, { total: number; count: number }>();
  payrollRecords.forEach((p) => {
    const prev = periodMap.get(p.periode) || { total: 0, count: 0 };
    periodMap.set(p.periode, { total: prev.total + p.total, count: prev.count + 1 });
  });

  const periodStats = Array.from(periodMap.entries()).map(([periode, data]) => ({
    periode,
    total: data.total,
    count: data.count,
  }));

  const maxPeriodTotal = Math.max(...periodStats.map((s) => s.total), 1);

  // Total Component Base for Percentage
  const grandComponentSum = totalGajiPokok + totalLembur + totalBonus + totalPotongan || 1;
  const pctPokok = Math.round((totalGajiPokok / grandComponentSum) * 100);
  const pctLembur = Math.round((totalLembur / grandComponentSum) * 100);
  const pctBonus = Math.round((totalBonus / grandComponentSum) * 100);
  const pctPotongan = Math.round((totalPotongan / grandComponentSum) * 100);

  const handleExport = () => {
    exportToExcel(filteredData, `Laporan_Gajiku_${filterPeriode}_${filterDivisi}.xlsx`);
    showToast('Export Berhasil', 'Laporan gaji berhasil diunduh dalam format Excel', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Laporan & Rekapitulasi Penggajian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis beban upah, rekap total dan kasbon per divisi, serta rincian komponen
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Laporan</span>
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-[16px] p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase">Filter Laporan:</span>
        </div>

        <div className="flex-1 flex flex-wrap items-center gap-3">
          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="Semua">Semua Periode</option>
            {uniquePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={filterDivisi}
            onChange={(e) => setFilterDivisi(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="Semua">Semua Divisi</option>
            {DAFTAR_DIVISI.map((d) => (
              <option key={d} value={d}>
                Divisi {d}
              </option>
            ))}
          </select>

          <select
            value={filterTipeGaji}
            onChange={(e) => setFilterTipeGaji(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="Semua">Semua Tipe Karyawan</option>
            <option value="Harian">Harian</option>
            <option value="Borongan">Borongan</option>
          </select>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-[16px] p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Pengeluaran Gaji (Bersih)</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{formatRupiah(totalPengeluaran)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{filteredData.length} Slip diterbitkan</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[16px] p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Gaji yang Diambil (Kasbon)</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{formatRupiah(totalDiambilSemua)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Uang muka yang dipotong</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[16px] p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Gaji Kotor (Sebelum Kasbon)</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatRupiah(totalKotorSemua)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Akumulasi upah kotor</p>
        </div>

        {/*}
        <div className="bg-white border border-slate-200 rounded-[16px] p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Rata-rata Gaji Bersih</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatRupiah(rataRataGaji)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Per orang per transaksi</p>
        </div>*/}
        
      </div>

      {/* LAPORAN KHUSUS PER DIVISI (REQUEST USER) */}
      <div className="bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Laporan Total Pengeluaran & Kasbon per Divisi
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi total gaji bersih dan total yang diambil (kasbon) dikelompokkan berdasarkan 5 divisi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Periode: {filterPeriode}
            </span>
          </div>
        </div>

        {/* 5 Cards Per Divisi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {divisiStats.map((item) => {
            const theme = DIVISI_THEMES[item.divisi];
            const isSelected = filterDivisi === item.divisi;

            return (
              <div
                key={item.divisi}
                onClick={() => setFilterDivisi(filterDivisi === item.divisi ? 'Semua' : item.divisi)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${theme.bg} ${theme.text} ${theme.border}`}
                  >
                    {item.divisi}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {item.recordsCount} Slip
                  </span>
                </div>

                <div className="space-y-2 mt-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">
                      Total Gaji Divisi:
                    </span>
                    <span className="text-base font-extrabold text-slate-900 block">
                      {formatRupiah(item.totalGaji)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>Total Diambil:</span>
                      <span className="text-rose-600 font-bold">{item.persenDiambil}%</span>
                    </span>
                    <span className="text-xs font-bold text-rose-600 block mt-0.5">
                      {formatRupiah(item.totalDiambil)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Proporsi:</span>
                      <span className="font-semibold text-slate-800">{item.persenDariTotal}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${theme.bar}`}
                        style={{ width: `${item.persenDariTotal}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabel Komparasi Divisi Lengkap */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="py-3 px-4 font-semibold text-slate-700 uppercase tracking-wider">
                  Divisi
                </th>
                <th className="py-3 px-4 font-semibold text-slate-700 uppercase tracking-wider text-center">
                  Jml Orang
                </th>
                <th className="py-3 px-4 font-semibold text-slate-700 uppercase tracking-wider text-center">
                  Jml Slip
                </th>
                <th className="py-3 px-4 font-semibold text-slate-700 uppercase tracking-wider text-right">
                  Total Kotor (Gross)
                </th>
                <th className="py-3 px-4 font-semibold text-rose-600 uppercase tracking-wider text-right">
                  Total Yang Diambil (Kasbon)
                </th>
                <th className="py-3 px-4 font-semibold text-blue-700 uppercase tracking-wider text-right">
                  Total Pengeluaran Gaji (Bersih)
                </th>
                <th className="py-3 px-4 font-semibold text-slate-700 uppercase tracking-wider text-right">
                  Rata-rata / Orang
                </th>
                <th className="py-3 px-4 font-semibold text-slate-700 uppercase tracking-wider text-center">
                  Beban (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {divisiStats.map((d) => {
                const theme = DIVISI_THEMES[d.divisi];
                return (
                  <tr key={d.divisi} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-bold text-xs border ${theme.bg} ${theme.text} ${theme.border}`}
                        >
                          {d.divisi}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">
                      {d.employeeCount} orang
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-600">
                      {d.recordsCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatRupiah(d.totalKotor)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 bg-rose-50/30">
                      {formatRupiah(d.totalDiambil)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-700 bg-blue-50/20">
                      {formatRupiah(d.totalGaji)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatRupiah(d.rataRata)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {d.persenDariTotal}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900">
                <td className="py-3.5 px-4 uppercase">
                  TOTAL KESELURUHAN (SEMUA DIVISI)
                </td>
                <td className="py-3.5 px-4 text-center">
                  {new Set(periodFilteredData.map((r) => r.employeeId)).size} orang
                </td>
                <td className="py-3.5 px-4 text-center">
                  {periodFilteredData.length}
                </td>
                <td className="py-3.5 px-4 text-right font-mono">
                  {formatRupiah(totalKotorKeseluruhan)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-600">
                  {formatRupiah(totalDiambilKeseluruhan)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-blue-700 text-sm">
                  {formatRupiah(totalBebanSemuaDivisi)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                  {periodFilteredData.length > 0
                    ? formatRupiah(Math.round(totalBebanSemuaDivisi / periodFilteredData.length))
                    : 'Rp 0'}
                </td>
                <td className="py-3.5 px-4 text-center">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Tren Antar Periode */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Perbandingan Beban Gaji Antar Periode
              </h3>
              <p className="text-xs text-slate-500">Historis total pembayaran penggajian per minggu/bulan</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>

          <div className="mt-6 h-64 flex items-end gap-4 px-2 border-b border-slate-100">
            {periodStats.map((item, idx) => {
              const hPct = Math.max(15, Math.round((item.total / maxPeriodTotal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-10">
                    {formatRupiah(item.total)} ({item.count} orang)
                  </div>
                  <div
                    className="w-full max-w-[44px] bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-all"
                    style={{ height: `${hPct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 mt-2 truncate w-full text-center">
                    {item.periode.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proporsi Komponen Gaji */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">Proporsi Komponen Gaji</h3>
              <p className="text-xs text-slate-500">Persentase alokasi pengeluaran</p>
            </div>
            <PieChart className="w-5 h-5 text-purple-600" />
          </div>

          <div className="space-y-3.5 pt-2 text-xs">
            {/* Gaji Pokok */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Gaji Pokok
                </span>
                <span>{formatRupiah(totalGajiPokok)} ({pctPokok}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pctPokok}%` }} />
              </div>
            </div>

            {/* Lembur */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Lembur
                </span>
                <span>{formatRupiah(totalLembur)} ({pctLembur}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pctLembur}%` }} />
              </div>
            </div>

            {/* Bonus */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Bonus Koor & Tambahan
                </span>
                <span>{formatRupiah(totalBonus)} ({pctBonus}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctBonus}%` }} />
              </div>
            </div>

            {/* Potongan */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Potongan Telat & Kasbon
                </span>
                <span>{formatRupiah(totalPotongan)} ({pctPotongan}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pctPotongan}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>TOTAL BERSIH DIBAYARKAN:</span>
            <span className="text-blue-600 text-sm">{formatRupiah(totalPengeluaran)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
