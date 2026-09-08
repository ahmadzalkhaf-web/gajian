import React, { useState, useMemo } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { useAuth } from '../context/AuthContext';
import { PayrollRecord } from '../types';
import { formatRupiah, formatTanggal } from '../utils/formatCurrency';
import { exportToExcel, exportToCSV } from '../services/exportService';
import {
  Search,
  Filter,
  FileText,
  Trash2,
  Edit,
  MessageCircle,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  Layers,
  X,
  Eye
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const RiwayatPage: React.FC = () => {
  const {
    payrollRecords,
    employees,
    settings,
    openSlipForRecord,
    deletePayroll,
    updatePayroll,
    setActivePage,
  } = usePayroll();

  const { role, employee: currentEmployee } = useAuth();
  const { showToast } = useToast();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNama, setFilterNama] = useState('Semua');
  const [filterPeriode, setFilterPeriode] = useState('Semua');
  const [filterTipeGaji, setFilterTipeGaji] = useState('Semua');

  // Sorting
  const [sortField, setSortField] = useState<'tanggalDibuat' | 'total' | 'nama'>('tanggalDibuat');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail Modal
  const [viewDetailRecord, setViewDetailRecord] = useState<PayrollRecord | null>(null);

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<PayrollRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter list by role (if Karyawan, restricted to self!)
  const baseRecords = useMemo(() => {
    if (role === 'KARYAWAN' && currentEmployee) {
      return payrollRecords.filter(
        (p) =>
          p.employeeId === currentEmployee.id ||
          p.nama.toLowerCase() === currentEmployee.nama.toLowerCase()
      );
    }
    return payrollRecords;
  }, [payrollRecords, role, currentEmployee]);

  // Unique list of periods & employee names for filters
  const uniquePeriods = useMemo(() => {
    const set = new Set(baseRecords.map((p) => p.periode).filter(Boolean));
    return Array.from(set);
  }, [baseRecords]);

  const uniqueEmployees = useMemo(() => {
    const set = new Set(baseRecords.map((p) => p.nama).filter(Boolean));
    return Array.from(set);
  }, [baseRecords]);

  // Filtered & Sorted Records
  const processedRecords = useMemo(() => {
    return baseRecords
      .filter((rec) => {
        const matchesSearch =
          rec.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rec.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesNama = filterNama === 'Semua' || rec.nama === filterNama;
        const matchesPeriode = filterPeriode === 'Semua' || rec.periode === filterPeriode;
        const matchesTipe = filterTipeGaji === 'Semua' || rec.tipeGaji === filterTipeGaji;

        return matchesSearch && matchesNama && matchesPeriode && matchesTipe;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'tanggalDibuat') {
          comp = new Date(a.tanggalDibuat).getTime() - new Date(b.tanggalDibuat).getTime();
        } else if (sortField === 'total') {
          comp = a.total - b.total;
        } else if (sortField === 'nama') {
          comp = a.nama.localeCompare(b.nama);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [baseRecords, searchTerm, filterNama, filterPeriode, filterTipeGaji, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(processedRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedRecords.slice(start, start + itemsPerPage);
  }, [processedRecords, currentPage, itemsPerPage]);

  const handleSort = (field: 'tanggalDibuat' | 'total' | 'nama') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSendWa = (record: PayrollRecord) => {
    const emp = employees.find(
      (e) => e.id === record.employeeId || e.nama.toLowerCase() === record.nama.toLowerCase()
    );
    const waNumber = emp ? emp.noWhatsapp : '';
    if (!waNumber) {
      showToast('Nomor WhatsApp Tidak Ditemukan', 'Data kontak karyawan belum tersedia', 'warning');
      return;
    }

    const cleanWa = waNumber.replace(/[^0-9]/g, '');
    const slipLink = emp?.linkSlip || window.location.origin;
    const msg = encodeURIComponent(
      `Halo ${record.nama},\n\nBerikut informasi gaji Anda untuk periode ${record.periode}.\n\nTotal Gaji:\n${formatRupiah(record.total)}\n\nSilakan akses slip gaji melalui link berikut:\n\n${slipLink}\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${cleanWa}?text=${msg}`, '_blank');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePayroll(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = () => {
    exportToExcel(processedRecords, `Riwayat_Penggajian_${filterPeriode !== 'Semua' ? filterPeriode : 'Semua'}.xlsx`);
    showToast('Export Excel Berhasil', `${processedRecords.length} baris data berhasil diekspor`, 'success');
  };

  const handleExportCsv = () => {
    exportToCSV(processedRecords, `Riwayat_Penggajian_${filterPeriode !== 'Semua' ? filterPeriode : 'Semua'}.csv`);
    showToast('Export CSV Berhasil', `${processedRecords.length} baris data berhasil diekspor`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header Info & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Riwayat Penggajian Karyawan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar transaksi penggajian tersimpan di Sheet 2 (PENGGAJIAN) Google Spreadsheet
          </p>
        </div>

        {/* Export & Action Buttons */}
        {role === 'ADMIN' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[16px] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID, Nama, Catatan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 outline-none"
            />
          </div>

          {/* Filter Periode */}
          <div>
            <select
              value={filterPeriode}
              onChange={(e) => {
                setFilterPeriode(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-600 outline-none"
            >
              <option value="Semua">Semua Periode</option>
              {uniquePeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Nama Karyawan (Admin Only) */}
          {role === 'ADMIN' && (
            <div>
              <select
                value={filterNama}
                onChange={(e) => {
                  setFilterNama(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 px-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="Semua">Semua Karyawan</option>
                {uniqueEmployees.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter Tipe Gaji */}
          <div>
            <select
              value={filterTipeGaji}
              onChange={(e) => {
                setFilterTipeGaji(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-600 outline-none"
            >
              <option value="Semua">Semua Tipe Gaji</option>
              <option value="Harian">Harian</option>
              <option value="Borongan">Borongan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 px-4">ID</th>
                <th
                  onClick={() => handleSort('nama')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Periode</th>
                <th className="py-3.5 px-4">Tipe Gaji</th>
                <th
                  onClick={() => handleSort('total')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Total Diterima</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th
                  onClick={() => handleSort('tanggalDibuat')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-sm">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada riwayat penggajian yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-mono">
                        {rec.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{rec.nama}</div>
                      {rec.keterangan && (
                        <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                          {rec.keterangan}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {rec.periode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          rec.tipeGaji === 'Harian'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {rec.tipeGaji}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-600">
                      {formatRupiah(rec.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Lunas</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {formatTanggal(rec.tanggalDibuat)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewDetailRecord(rec)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Lihat Detail Rincian"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openSlipForRecord(rec)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Buka Slip Gaji"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleSendWa(rec)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Kirim Notifikasi WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </button>
                        {role === 'ADMIN' && (
                          <button
                            onClick={() => setDeleteTarget(rec)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Penggajian"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginatedRecords.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[16px] p-8 text-center text-slate-400">
            Tidak ada data penggajian yang ditemukan.
          </div>
        ) : (
          paginatedRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-slate-200 rounded-[16px] p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono font-semibold text-slate-700">
                      {rec.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        rec.tipeGaji === 'Harian'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {rec.tipeGaji}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mt-1.5">{rec.nama}</h4>
                  <p className="text-xs text-slate-500">{rec.periode}</p>
                </div>

                <div className="text-right">
                  <p className="text-base font-extrabold text-blue-600">{formatRupiah(rec.total)}</p>
                  <span className="inline-block mt-0.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Lunas
                  </span>
                </div>
              </div>

              {rec.keterangan && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                  {rec.keterangan}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400">{formatTanggal(rec.tanggalDibuat)}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewDetailRecord(rec)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg"
                    title="Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openSlipForRecord(rec)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Slip</span>
                  </button>
                  <button
                    onClick={() => handleSendWa(rec)}
                    className="p-1.5 text-emerald-600 bg-emerald-50 rounded-lg"
                    title="Kirim WA"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  {role === 'ADMIN' && (
                    <button
                      onClick={() => setDeleteTarget(rec)}
                      className="p-1.5 text-rose-500 bg-rose-50 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white border border-slate-200 rounded-[16px] p-3 flex items-center justify-between text-xs text-slate-600 shadow-xs">
          <span>
            Halaman <span className="font-semibold text-slate-900">{currentPage}</span> dari{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span> ({processedRecords.length} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewDetailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Detail Rincian Gaji</h3>
              <button
                onClick={() => setViewDetailRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Karyawan</span>
                <span className="font-bold text-slate-800">{viewDetailRecord.nama}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Periode</span>
                <span className="font-semibold text-slate-800">{viewDetailRecord.periode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tipe Gaji</span>
                <span className="font-semibold text-slate-800">{viewDetailRecord.tipeGaji}</span>
              </div>

              {viewDetailRecord.tipeGaji === 'Harian' ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Hadir</span>
                    <span>{viewDetailRecord.hadir} hari × {formatRupiah(viewDetailRecord.gajiPokok)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Lembur</span>
                    <span>{viewDetailRecord.lembur} × {formatRupiah(viewDetailRecord.gajiPokok)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Bonus Koor 1 & 2</span>
                    <span className="text-emerald-600 font-semibold">
                      +{formatRupiah(viewDetailRecord.bonusKoor1 + viewDetailRecord.bonusKoor2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Bonus 1, 2, 3</span>
                    <span className="text-emerald-600 font-semibold">
                      +{formatRupiah(viewDetailRecord.bonus1 + viewDetailRecord.bonus2 + viewDetailRecord.bonus3)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                    <span>Potongan Telat ({viewDetailRecord.telat} × Rp 5)</span>
                    <span>-{formatRupiah(viewDetailRecord.telat * 5)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                    <span>Gaji Diambil (1 Minggu)</span>
                    <span>-{formatRupiah(viewDetailRecord.gajiDiambil)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Gaji Pokok Borongan</span>
                    <span className="font-semibold">{formatRupiah(viewDetailRecord.gajiPokok)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Lembur</span>
                    <span className="font-semibold">{formatRupiah(viewDetailRecord.lembur)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Bonus Koor 1</span>
                    <span className="text-emerald-600 font-semibold">+{formatRupiah(viewDetailRecord.bonusKoor1)}</span>
                  </div>
                </>
              )}

              {viewDetailRecord.keterangan && (
                <div className="py-1 border-b border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Keterangan:</span>
                  <span className="text-slate-700 font-medium">{viewDetailRecord.keterangan}</span>
                </div>
              )}

              {viewDetailRecord.komentar && (
                <div className="py-1.5 px-2.5 bg-blue-50/70 rounded-lg border border-blue-100">
                  <span className="text-blue-700 font-bold block mb-0.5 text-[11px]">Komentar (Spreadsheet):</span>
                  <span className="text-slate-800 font-medium whitespace-pre-line">{viewDetailRecord.komentar}</span>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-800">TOTAL DITERIMA</span>
                <span className="text-blue-600 text-base">{formatRupiah(viewDetailRecord.total)}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  const rec = viewDetailRecord;
                  setViewDetailRecord(null);
                  openSlipForRecord(rec);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Buka Dokumen Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-sm w-full p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hapus Data Penggajian?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Yakin ingin menghapus data penggajian <span className="font-bold text-slate-800">{deleteTarget.nama}</span> ({deleteTarget.periode})?
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-[10px] border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
