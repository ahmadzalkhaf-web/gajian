import React, { useState } from 'react';
import { Employee, StatusKaryawan, DivisiKaryawan, DAFTAR_DIVISI } from '../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  MessageCircle,
  Check,
  FileText,
  Tag
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { formatTanggal } from '../utils/formatCurrency';

export const getDivisiBadgeClass = (divisi?: string) => {
  switch (divisi) {
    case 'Apparel':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Distro':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Jersey':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Hijab':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Scarf':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

interface EmployeeTableProps {
  employees: Employee[];
  onAddClick: () => void;
  onEditClick: (emp: Employee) => void;
  onDeleteClick: (id: string, name: string) => void;
  onOpenSlip: (emp: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onOpenSlip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [divisiFilter, setDivisiFilter] = useState<string>('Semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast } = useToast();

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.divisi && emp.divisi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      emp.noWhatsapp.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'Semua' || emp.status === statusFilter;

    const matchesDivisi =
      divisiFilter === 'Semua' || emp.divisi === divisiFilter;

    return matchesSearch && matchesStatus && matchesDivisi;
  });

  const handleCopyLink = (emp: Employee) => {
    navigator.clipboard.writeText(emp.linkSlip);
    setCopiedId(emp.id);
    showToast('Link Disalin!', `Link slip untuk ${emp.nama} berhasil disalin ke clipboard`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendWhatsApp = (emp: Employee) => {
    const cleanWa = emp.noWhatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Halo ${emp.nama},\n\nBerikut informasi akses portal slip gaji Anda di GAJIKU.\n\nLink Slip Pribadi:\n${emp.linkSlip}\n\nToken Akses:\n${emp.tokenAkses}\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${cleanWa}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-[16px] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, ID, jabatan, divisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap hidden lg:inline">
              Divisi:
            </span>
            <select
              value={divisiFilter}
              onChange={(e) => setDivisiFilter(e.target.value)}
              className="h-10 px-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-600 outline-none"
            >
              <option value="Semua">Semua Divisi</option>
              {DAFTAR_DIVISI.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap hidden lg:inline">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-600 outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <button
          onClick={onAddClick}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-xs hover:shadow transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="py-3.5 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Nama
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Divisi
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Jabatan
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Rekening / Bank
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-sm">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data karyawan yang cocok.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    id={`employee-row-${emp.id}`}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-mono">
                        {emp.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{emp.nama}</div>
                      <div className="text-[11px] text-slate-600">Gabung: {formatTanggal(emp.tanggalBergabung)}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getDivisiBadgeClass(
                          emp.divisi
                        )}`}
                      >
                        {emp.divisi || 'Apparel'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {emp.jabatan || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-mono text-xs">{emp.noWhatsapp}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-xs">{emp.namaBank}</div>
                      <div className="font-mono text-xs text-slate-600">{emp.noRekening || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          emp.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenSlip(emp)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Slip Gaji"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyLink(emp)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Salin Link Slip"
                        >
                          {copiedId === emp.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSendWhatsApp(emp)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Kirim Info via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => onEditClick(emp)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Karyawan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(emp.id, emp.nama)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Karyawan"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredEmployees.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[16px] p-8 text-center text-slate-400">
            Tidak ada karyawan yang ditemukan.
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              id={`employee-card-mobile-${emp.id}`}
              className="bg-white border border-slate-200 rounded-[16px] p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono font-semibold text-slate-700">
                      {emp.id}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getDivisiBadgeClass(
                        emp.divisi
                      )}`}
                    >
                      {emp.divisi || 'Apparel'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        emp.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mt-1.5">
                    {emp.nama}
                  </h4>
                  <p className="text-xs text-slate-500">{emp.jabatan || 'Karyawan'}</p>
                </div>

                <button
                  onClick={() => onOpenSlip(emp)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Slip</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 text-slate-600">
                <div>
                  <p className="text-[10px] text-slate-400">WhatsApp</p>
                  <p className="font-mono">{emp.noWhatsapp}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Rekening</p>
                  <p className="truncate">{emp.namaBank}: {emp.noRekening || '-'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(emp)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                  >
                    {copiedId === emp.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Link</span>
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(emp)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WA</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditClick(emp)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteClick(emp.id, emp.nama)}
                    className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
