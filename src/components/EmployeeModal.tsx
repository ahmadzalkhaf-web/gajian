import React, { useState, useEffect } from 'react';
import { Employee, StatusKaryawan, DivisiKaryawan, DAFTAR_DIVISI } from '../types';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { generateNextEmployeeId, generateSlipToken, generateSlipLink } from '../utils/generateToken';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id' | 'tokenAkses' | 'linkSlip'>) => Promise<void>;
  onUpdate?: (data: Employee) => Promise<void>;
  editEmployee?: Employee | null;
  existingIds: string[];
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editEmployee,
  existingIds,
}) => {
  const [nama, setNama] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [noRekening, setNoRekening] = useState('');
  const [namaBank, setNamaBank] = useState('BCA');
  const [jabatan, setJabatan] = useState('');
  const [divisi, setDivisi] = useState<DivisiKaryawan>('Apparel');
  const [status, setStatus] = useState<StatusKaryawan>('Aktif');
  const [tanggalBergabung, setTanggalBergabung] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const nextAutoId = editEmployee ? editEmployee.id : generateNextEmployeeId(existingIds);

  useEffect(() => {
    if (editEmployee) {
      setNama(editEmployee.nama);
      setNoWhatsapp(editEmployee.noWhatsapp);
      setNoRekening(editEmployee.noRekening);
      setNamaBank(editEmployee.namaBank || 'BCA');
      setJabatan(editEmployee.jabatan);
      setDivisi(editEmployee.divisi || 'Apparel');
      setStatus(editEmployee.status);
      setTanggalBergabung(editEmployee.tanggalBergabung || new Date().toISOString().split('T')[0]);
    } else {
      setNama('');
      setNoWhatsapp('');
      setNoRekening('');
      setNamaBank('BCA');
      setJabatan('');
      setDivisi('Apparel');
      setStatus('Aktif');
      setTanggalBergabung(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [editEmployee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama karyawan wajib diisi.');
      return;
    }
    if (!noWhatsapp.trim()) {
      setError('Nomor WhatsApp wajib diisi.');
      return;
    }

    // Format WA: convert 08xxx to 628xxx
    let formattedWa = noWhatsapp.trim().replace(/[^0-9]/g, '');
    if (formattedWa.startsWith('0')) {
      formattedWa = '62' + formattedWa.substring(1);
    } else if (!formattedWa.startsWith('62')) {
      formattedWa = '62' + formattedWa;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editEmployee && onUpdate) {
        await onUpdate({
          ...editEmployee,
          nama: nama.trim(),
          noWhatsapp: formattedWa,
          noRekening: noRekening.trim(),
          namaBank: namaBank.trim(),
          jabatan: jabatan.trim(),
          divisi,
          status,
          tanggalBergabung,
        });
      } else {
        await onSave({
          nama: nama.trim(),
          noWhatsapp: formattedWa,
          noRekening: noRekening.trim(),
          namaBank: namaBank.trim(),
          jabatan: jabatan.trim(),
          divisi,
          status,
          tanggalBergabung,
        });
      }
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-[20px] max-w-lg w-full p-6 md:p-7 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editEmployee ? 'Perbarui informasi profil dan rekening' : 'ID dan Token Slip otomatis dibuat sistem'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ID Karyawan (Otomatis)
              </label>
              <input
                type="text"
                value={nextAutoId}
                disabled
                className="w-full h-11 px-3 rounded-[10px] bg-slate-100 border border-slate-200 text-slate-600 text-sm font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusKaryawan)}
                className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ahmad Fauzi"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nomor WhatsApp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="08123456789 atau 628123456789"
              value={noWhatsapp}
              onChange={(e) => setNoWhatsapp(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-600 mt-1">
              Digunakan untuk pengiriman slip gaji via WhatsApp
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Bank
              </label>
              <select
                value={namaBank}
                onChange={(e) => setNamaBank(e.target.value)}
                className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="BCA">BCA</option>
                <option value="BRI">BRI</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BNI">BNI</option>
                <option value="BSI">BSI</option>
                <option value="CIMB Niaga">CIMB Niaga</option>
                <option value="Bank Jago">Bank Jago</option>
                <option value="Tunai">Tunai / Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                placeholder="1234567890"
                value={noRekening}
                onChange={(e) => setNoRekening(e.target.value)}
                className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Divisi Karyawan <span className="text-rose-500">*</span>
              </label>
              <select
                value={divisi}
                onChange={(e) => setDivisi(e.target.value as DivisiKaryawan)}
                className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm font-semibold focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
              >
                {DAFTAR_DIVISI.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Jabatan / Peran
              </label>
              <input
                type="text"
                placeholder="Contoh: Operator / Staff"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tanggal Bergabung
            </label>
            <input
              type="date"
              value={tanggalBergabung}
              onChange={(e) => setTanggalBergabung(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] bg-white border border-[#CBD5E1] text-slate-800 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-xs hover:shadow transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Karyawan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
