import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Employee, PayrollRecord, CompanySettings } from '../types';
import { formatRupiah, formatTanggal } from '../utils/formatCurrency';
import {
  Printer,
  Download,
  Building2,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare,
  Edit3,
  Save,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { usePayroll } from '../context/PayrollContext';
import { useAuth } from '../context/AuthContext';

interface SlipGajiProps {
  employee: Employee;
  payroll?: PayrollRecord | null;
  settings: CompanySettings;
  onBack?: () => void;
  isStandalone?: boolean;
}

export const SlipGaji: React.FC<SlipGajiProps> = ({
  employee,
  payroll,
  settings,
  onBack,
  isStandalone = false,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { updatePayrollComment } = usePayroll();
  const { role } = useAuth();

  const [isSavingImage, setIsSavingImage] = useState(false);
  const [komentar, setKomentar] = useState<string>(payroll?.komentar || '');
  const [isEditingKomentar, setIsEditingKomentar] = useState<boolean>(false);
  const [isSavingKomentar, setIsSavingKomentar] = useState<boolean>(false);

  useEffect(() => {
    setKomentar(payroll?.komentar || '');
  }, [payroll?.id, payroll?.komentar]);

  const periodeName = payroll?.periode || settings.periodeAktif;
  const safeName = employee.nama.replace(/[^a-zA-Z0-9]/g, '_');
  const safePeriode = periodeName.replace(/[^a-zA-Z0-9]/g, '_');

  // Cetak / Simpan sebagai PDF via dialog cetak browser
  const handlePrint = () => {
    window.print();
  };

  // Simpan langsung sebagai file Gambar PNG beresolusi tinggi
  const handleSaveImage = async () => {
    if (!printRef.current) return;
    setIsSavingImage(true);
    showToast('Menyiapkan Gambar', 'Sedang memproses slip gaji ke format gambar PNG...', 'info');

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Slip_Gaji_${safeName}_${safePeriode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Slip Gaji Disimpan!', `File Slip_Gaji_${safeName}.png berhasil diunduh.`, 'success');
    } catch (err) {
      console.error('Gagal menyimpan gambar:', err);
      showToast('Gagal Menyimpan Gambar', 'Gunakan menu Cetak / Simpan PDF sebagai alternatif.', 'error');
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleSaveKomentar = async () => {
    if (!payroll?.id) {
      showToast('Data Penggajian Kosong', 'Tidak ada data penggajian aktif untuk disimpan komentarnya', 'warning');
      return;
    }
    setIsSavingKomentar(true);
    try {
      await updatePayrollComment(payroll.id, komentar.trim());
      setIsEditingKomentar(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('Gagal Menyimpan Komentar', msg, 'error');
    } finally {
      setIsSavingKomentar(false);
    }
  };

  const tipeGaji = payroll?.tipeGaji || 'Harian';
  const isHarian = tipeGaji === 'Harian';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Top Bar Actions: Hanya Menampilkan Tombol Simpan / Cetak (Hidden on Print) */}
      <div className="print:hidden bg-white border border-slate-200 rounded-[16px] p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dokumen Slip Gaji</span>
            </span>
          )}
        </div>

        {/* Action Buttons: Simpan Gambar PNG & Simpan / Cetak PDF */}
        <div className="flex items-center gap-2">
          {/* Tombol Simpan Gambar PNG */}
          <button
            onClick={handleSaveImage}
            disabled={isSavingImage}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isSavingImage ? 'Menyimpan...' : 'Simpan Gambar (PNG)'}</span>
          </button>

          {/* Tombol Simpan / Cetak PDF */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs hover:shadow transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Simpan / Cetak (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Slip Gaji Document */}
      <div
        ref={printRef}
        id="slip-gaji-printable"
        className="bg-white border border-slate-200 rounded-[20px] p-6 md:p-10 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 text-slate-800"
      >
        {/* Header Perusahaan */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm print:border print:border-slate-300">
              {settings.logoPerusahaan || '🏢'}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {settings.namaPerusahaan}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mt-0.5 leading-relaxed">
                {settings.alamat}
              </p>
              {settings.noWhatsappAdmin && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kontak: +{settings.noWhatsappAdmin}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs tracking-wider border border-blue-100 uppercase">
              SLIP GAJI RESMI
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              ID: {payroll?.id || `SLIP-${employee.id}`}
            </p>
          </div>
        </div>

        {/* Informasi Karyawan */}
        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Nama Karyawan</span>
            <span className="font-bold text-slate-900 text-sm">{employee.nama}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">ID Karyawan</span>
            <span className="font-mono font-semibold text-slate-800">{employee.id}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Divisi</span>
            <span className="font-bold text-slate-800">{employee.divisi || payroll?.divisi || 'Apparel'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Jabatan</span>
            <span className="font-semibold text-slate-800">{employee.jabatan || 'Karyawan'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Periode</span>
            <span className="font-bold text-blue-600">{payroll?.periode || settings.periodeAktif}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Tipe Gaji</span>
            <span className="font-semibold text-slate-800">{tipeGaji}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Rekening Pembayaran</span>
            <span className="font-semibold text-slate-800">
              {employee.namaBank} - {employee.noRekening || 'Tunai'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Status</span>
            <span className="font-semibold text-emerald-600">Terverifikasi</span>
          </div>
        </div>

        {/* Detail Perhitungan */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
            RINCIAN PENGHASILAN ({tipeGaji.toUpperCase()})
          </h4>

          {isHarian ? (
            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-medium text-slate-800">Gaji Pokok Hadir</span>
                  <span className="text-xs text-slate-400 ml-2">
                    ({payroll?.hadir ?? 0} hari × {formatRupiah(payroll?.gajiPokok ?? 0)})
                  </span>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatRupiah((payroll?.hadir ?? 0) * (payroll?.gajiPokok ?? 0))}
                </span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-medium text-slate-800">Lembur</span>
                  <span className="text-xs text-slate-400 ml-2">
                    ({payroll?.lembur ?? 0} × {formatRupiah(payroll?.gajiPokok ?? 0)})
                  </span>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatRupiah((payroll?.lembur ?? 0) * (payroll?.gajiPokok ?? 0))}
                </span>
              </div>

              {((payroll?.bonusKoor1 ?? 0) > 0 || (payroll?.bonusKoor2 ?? 0) > 0) && (
                <div className="py-2.5 flex justify-between items-center text-emerald-700 bg-emerald-50/40 px-2 rounded-lg">
                  <div>
                    <span className="font-medium">Bonus Koor (1 & 2)</span>
                    <span className="text-xs text-emerald-600 ml-2">
                      ({formatRupiah(payroll?.bonusKoor1 ?? 0)} + {formatRupiah(payroll?.bonusKoor2 ?? 0)})
                    </span>
                  </div>
                  <span className="font-semibold">
                    +{formatRupiah((payroll?.bonusKoor1 ?? 0) + (payroll?.bonusKoor2 ?? 0))}
                  </span>
                </div>
              )}

              {((payroll?.bonus1 ?? 0) > 0 || (payroll?.bonus2 ?? 0) > 0 || (payroll?.bonus3 ?? 0) > 0) && (
                <div className="py-2.5 flex justify-between items-center text-emerald-700 bg-emerald-50/40 px-2 rounded-lg">
                  <div>
                    <span className="font-medium">Bonus Tambahan (1, 2, 3)</span>
                    <span className="text-xs text-emerald-600 ml-2">
                      ({formatRupiah(payroll?.bonus1 ?? 0)} + {formatRupiah(payroll?.bonus2 ?? 0)} + {formatRupiah(payroll?.bonus3 ?? 0)})
                    </span>
                  </div>
                  <span className="font-semibold">
                    +{formatRupiah((payroll?.bonus1 ?? 0) + (payroll?.bonus2 ?? 0) + (payroll?.bonus3 ?? 0))}
                  </span>
                </div>
              )}
            </div>
          ) : (
            // Borongan
            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-medium text-slate-800">Gaji Pokok Borongan</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(payroll?.gajiPokok ?? 0)}
                </span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-medium text-slate-800">Lembur Borongan</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(payroll?.lembur ?? 0)}
                </span>
              </div>

              {(payroll?.bonusKoor1 ?? 0) > 0 && (
                <div className="py-2.5 flex justify-between items-center text-emerald-700 bg-emerald-50/40 px-2 rounded-lg">
                  <div>
                    <span className="font-medium">Bonus Koor 1</span>
                  </div>
                  <span className="font-semibold">
                    +{formatRupiah(payroll?.bonusKoor1 ?? 0)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Rincian Potongan */}
          {isHarian && ((payroll?.telat ?? 0) > 0 || (payroll?.gajiDiambil ?? 0) > 0) && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
                POTONGAN
              </h4>
              <div className="divide-y divide-slate-100 text-sm">
                {(payroll?.telat ?? 0) > 0 && (
                  <div className="py-2 flex justify-between items-center text-rose-600">
                    <div>
                      <span>Potongan Telat</span>
                      <span className="text-xs text-rose-500 ml-2">
                        ({payroll?.telat} kejadian × Rp 5)
                      </span>
                    </div>
                    <span className="font-medium">
                      -{formatRupiah((payroll?.telat ?? 0) * 5)}
                    </span>
                  </div>
                )}

                {(payroll?.gajiDiambil ?? 0) > 0 && (
                  <div className="py-2 flex justify-between items-center text-rose-600">
                    <div>
                      <span>Gaji Diambil (Dalam 1 Minggu)</span>
                      <span className="text-xs text-rose-500 ml-2">Kasbon</span>
                    </div>
                    <span className="font-medium">
                      -{formatRupiah(payroll?.gajiDiambil ?? 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {payroll?.keterangan && (
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60">
              <span className="font-bold text-slate-700 block mb-0.5">Keterangan:</span>
              <span>{payroll.keterangan}</span>
            </div>
          )}

          {/* Kolom Komentar (Terkoneksi ke Google Spreadsheet) */}
          <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>note</span>
                <span className="print:hidden text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                  Spreadsheet
                </span>
              </div>

              {/* Tombol edit komentar (Hanya admin, tersembunyi saat cetak) */}
              {role === 'ADMIN' && payroll && !isEditingKomentar && (
                <button
                  type="button"
                  onClick={() => setIsEditingKomentar(true)}
                  className="print:hidden text-blue-600 hover:text-blue-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{komentar ? 'Ubah Komentar' : '+ Tambah Komentar'}</span>
                </button>
              )}
            </div>

            {isEditingKomentar ? (
              <div className="print:hidden space-y-2 mt-2">
                <textarea
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  rows={2}
                  placeholder="Ketik komentar untuk slip ini, akan otomatis tersimpan ke kolom Komentar di Google Spreadsheet..."
                  className="w-full p-2.5 rounded-lg border border-blue-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800 text-xs outline-none bg-white placeholder:text-slate-400"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setKomentar(payroll?.komentar || '');
                      setIsEditingKomentar(false);
                    }}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded-md text-xs font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveKomentar}
                    disabled={isSavingKomentar}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingKomentar ? 'Menyimpan...' : 'Simpan Komentar ke Spreadsheet'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-700 leading-relaxed font-normal">
                {komentar ? (
                  <p className="whitespace-pre-line font-medium text-slate-800">{komentar}</p>
                ) : (
                  <p className="text-slate-400 italic">
                    - Tidak ada komentar khusus untuk periode ini -
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Total Box */}
          <div className="mt-6 pt-4 border-t-2 border-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                TOTAL GAJI DITERIMA
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Ditransfer ke Rekening {employee.namaBank}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-black text-[#2563EB] tracking-tight">
                {formatRupiah(payroll?.total ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Tanda Tangan Footer 
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-slate-500">Diterima oleh Karyawan,</p>
            <div className="h-16 flex items-end justify-center">
              <p className="font-bold text-slate-900 border-b border-slate-400 pb-1 px-6">
                {employee.nama}
              </p>
            </div>
          </div>
          <div>
            <p className="text-slate-500">Disetujui Bagian Keuangan / HRD,</p>
            <div className="h-16 flex items-end justify-center">
              <p className="font-bold text-slate-900 border-b border-slate-400 pb-1 px-6">
                {settings.namaAdmin || 'Budi Santoso'}
              </p>
            </div>
          </div>
        </div>
        */}

        {/* Footer Security Note */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Dokumen ini diterbitkan SYF STORE</span>
          </div>
          <span>Token Akses: {employee.tokenAkses}</span>
        </div>
      </div>
    </div>
  );
};
