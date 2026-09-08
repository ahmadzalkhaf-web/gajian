import React from 'react';
import { usePayroll } from '../context/PayrollContext';
import { DashboardCard } from '../components/DashboardCard';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { formatRupiah, formatTanggal } from '../utils/formatCurrency';
import {
  Users,
  Wallet,
  Gift,
  Scissors,
  Clock,
  Briefcase,
  Plus,
  Calculator,
  Download,
  BarChart3,
  TrendingUp,
  Award,
  ArrowRight,
  FileText
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { employees, payrollRecords, settings, isLoading, setActivePage, openSlipForRecord } = usePayroll();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  // Calculations for Stats Cards
  const totalKaryawan = employees.length;
  const karyawanAktif = employees.filter((e) => e.status === 'Aktif').length;

  // Filter penggajian periode aktif (atau semua jika periode aktif kosong)
  const currentPeriodPayrolls = payrollRecords.filter(
    (p) => !settings.periodeAktif || p.periode === settings.periodeAktif
  );
  const displayPayrolls = currentPeriodPayrolls.length > 0 ? currentPeriodPayrolls : payrollRecords;

  const totalPenggajian = displayPayrolls.reduce((sum, p) => sum + p.total, 0);

  const totalBonus = displayPayrolls.reduce(
    (sum, p) => sum + p.bonusKoor1 + p.bonusKoor2 + p.bonus1 + p.bonus2 + p.bonus3,
    0
  );

  const totalPotongan = displayPayrolls.reduce(
    (sum, p) => sum + (p.telat * 5) + p.gajiDiambil,
    0
  );

  const jumlahHarian = displayPayrolls.filter((p) => p.tipeGaji === 'Harian').length;
  const jumlahBorongan = displayPayrolls.filter((p) => p.tipeGaji === 'Borongan').length;

  // Karyawan dengan gaji tertinggi
  const topEarner = [...displayPayrolls].sort((a, b) => b.total - a.total)[0];

  // Penggajian terbaru
  const recentPayrolls = [...payrollRecords]
    .sort((a, b) => new Date(b.tanggalDibuat).getTime() - new Date(a.tanggalDibuat).getTime())
    .slice(0, 5);

  // Grouping by Periode for Chart
  const periodMap = new Map<string, number>();
  payrollRecords.forEach((p) => {
    const current = periodMap.get(p.periode) || 0;
    periodMap.set(p.periode, current + p.total);
  });

  const periodStats = Array.from(periodMap.entries()).map(([periode, total]) => ({
    periode,
    total,
  }));

  const maxPeriodTotal = Math.max(...periodStats.map((s) => s.total), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Header Notification */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-[20px] p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
            Periode Aktif: {settings.periodeAktif || 'Minggu Ini'}
          </span>
          <h2 className="text-xl md:text-2xl font-bold mt-2 tracking-tight">
            Selamat Datang di {settings.namaPerusahaan}
          </h2>
          <p className="text-xs md:text-sm text-blue-100 mt-1 max-w-xl">
            Sistem penggajian otomatis terhubung Google Spreadsheet. Kelola data kehadiran, kalkulasi real-time, dan terbitkan slip gaji karyawan.
          </p>
        </div>

        {/* Quick Actions in Banner */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActivePage('penggajian')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-xs transition-colors"
          >
            <Calculator className="w-4 h-4" />
            <span>Buat Penggajian</span>
          </button>
          <button
            onClick={() => setActivePage('karyawan')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-500/40 hover:bg-blue-500/60 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      {/* 6 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Total Karyawan */}
        <DashboardCard
          id="stat-total-karyawan"
          title="Total Karyawan"
          value={totalKaryawan}
          subtitle={`${karyawanAktif} Karyawan berstatus aktif`}
          icon={Users}
          trend={{ value: `${karyawanAktif} Aktif`, isPositive: true }}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        {/* 2. Total Penggajian Periode Ini */}
        <DashboardCard
          id="stat-total-penggajian"
          title="Total Penggajian Periode Ini"
          value={formatRupiah(totalPenggajian)}
          subtitle={settings.periodeAktif || 'Seluruh data'}
          icon={Wallet}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        {/* 3. Total Bonus */}
        <DashboardCard
          id="stat-total-bonus"
          title="Total Bonus"
          value={formatRupiah(totalBonus)}
          subtitle="Bonus Koor & Tunjangan Produksi"
          icon={Gift}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />

        {/* 4. Total Potongan */}
        <DashboardCard
          id="stat-total-potongan"
          title="Total Potongan"
          value={formatRupiah(totalPotongan)}
          subtitle="Potongan telat & pinjaman/kasbon"
          icon={Scissors}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />

        {/* 5. Jumlah Karyawan Harian */}
        <DashboardCard
          id="stat-karyawan-harian"
          title="Karyawan Harian"
          value={`${jumlahHarian} Orang`}
          subtitle="Tarif hadir harian & jam lembur"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />

        {/* 6. Jumlah Karyawan Borongan */}
        <DashboardCard
          id="stat-karyawan-borongan"
          title="Karyawan Borongan"
          value={`${jumlahBorongan} Orang`}
          subtitle="Berdasarkan proyek / kuota kerja"
          icon={Briefcase}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Quick Action Strip */}
      <div className="bg-white border border-slate-200 rounded-[16px] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Aksi Cepat:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActivePage('karyawan')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Kelola Karyawan</span>
          </button>
          <button
            onClick={() => setActivePage('penggajian')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Input Gaji</span>
          </button>
          <button
            onClick={() => setActivePage('riwayat')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Data</span>
          </button>
          <button
            onClick={() => setActivePage('laporan')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Lihat Laporan</span>
          </button>
        </div>
      </div>

      {/* Charts & Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bar Chart Pengeluaran Gaji per Periode */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Pengeluaran Gaji per Periode
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total pembayaran gaji karyawan tersinkronisasi
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
              {periodStats.length} Periode
            </span>
          </div>

          {/* Clean SVG Bar Chart */}
          <div className="mt-6 h-60 flex items-end gap-3 md:gap-6 pt-6 px-2 border-b border-slate-100">
            {periodStats.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Belum ada data periode penggajian.
              </div>
            ) : (
              periodStats.map((item, idx) => {
                const heightPercent = Math.max(15, Math.round((item.total / maxPeriodTotal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-800 text-white text-[10px] font-semibold py-1 px-2 rounded whitespace-nowrap z-10">
                      {formatRupiah(item.total)}
                    </div>
                    {/* Bar */}
                    <div
                      className="w-full max-w-[48px] bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-all duration-300 shadow-2xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[11px] text-slate-500 font-medium mt-2 truncate w-full text-center">
                      {item.periode.split(' ')[0]}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Karyawan dengan Gaji Tertinggi & Ringkasan Tipe */}
        <div className="lg:col-span-4 space-y-4">
          {/* Top Earner Card */}
          {topEarner && (
            <div className="bg-white border border-slate-200 rounded-[16px] p-5 shadow-xs">
              <div className="flex items-center gap-2.5 text-amber-500 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Gaji Tertinggi Periode Ini
                  </h4>
                  <p className="text-[11px] text-slate-400">{topEarner.periode}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-base font-bold text-slate-900">{topEarner.nama}</p>
                <p className="text-xs text-slate-500 font-medium">{topEarner.tipeGaji}</p>
                <p className="text-xl font-extrabold text-blue-600 mt-2">
                  {formatRupiah(topEarner.total)}
                </p>
              </div>
            </div>
          )}

          {/* Distribusi Tipe Gaji */}
          <div className="bg-white border border-slate-200 rounded-[16px] p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
              Distribusi Tipe Gaji
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Harian</span>
                  <span>{jumlahHarian} Karyawan</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${(jumlahHarian / Math.max(jumlahHarian + jumlahBorongan, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Borongan</span>
                  <span>{jumlahBorongan} Karyawan</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{
                      width: `${(jumlahBorongan / Math.max(jumlahHarian + jumlahBorongan, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Penggajian Terbaru */}
      <div className="bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Daftar Penggajian Terbaru</h3>
            <p className="text-xs text-slate-500 mt-0.5">5 transaksi penggajian terakhir yang tercatat</p>
          </div>
          <button
            onClick={() => setActivePage('riwayat')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {recentPayrolls.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Belum ada data penggajian tersimpan.
            </div>
          ) : (
            recentPayrolls.map((pay) => (
              <div
                key={pay.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {pay.nama.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{pay.nama}</p>
                    <p className="text-xs text-slate-400">
                      {pay.periode} • {pay.tipeGaji}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{formatRupiah(pay.total)}</p>
                    <p className="text-[11px] text-slate-400">{formatTanggal(pay.tanggalDibuat)}</p>
                  </div>
                  <button
                    onClick={() => openSlipForRecord(pay)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Buka Slip Gaji"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
