import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { CompanySettings } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/googleAppsScriptTemplate';
import { ModalTambahPeriode } from '../components/ModalTambahPeriode';
import {
  Settings,
  Link,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Building,
  Save,
  ShieldAlert,
  Database,
  Code2,
  ExternalLink,
  Calendar,
  FileSpreadsheet,
  Plus,
  Trash2,
  Layers,
  Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const PengaturanPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    periods,
    setActivePeriode,
    deletePeriod,
    apiUrl,
    setApiUrl,
    testConnection,
    isSyncing,
    fetchData,
  } = usePayroll();

  const { showToast } = useToast();

  // Form State for Company Settings
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [inputUrl, setInputUrl] = useState<string>(apiUrl);
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showPeriodeModal, setShowPeriodeModal] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const ok = await testConnection(inputUrl);
      if (ok) {
        setTestStatus({
          tested: true,
          success: true,
          message: 'Koneksi berhasil! Terhubung dengan Google Spreadsheet.',
        });
        showToast('Koneksi Berhasil', 'Terhubung ke Google Spreadsheet Apps Script', 'success');
      } else {
        setTestStatus({
          tested: true,
          success: false,
          message: 'Koneksi gagal. Periksa kembali URL deployment atau izin akses (Anyone).',
        });
        showToast('Koneksi Gagal', 'Pastikan URL benar dan Deploy sebagai Web App (Anyone)', 'error');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setTestStatus({
        tested: true,
        success: false,
        message: `Error: ${errorMsg}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiUrl = () => {
    setApiUrl(inputUrl.trim());
    showToast('URL Disimpan', 'Konfigurasi Google Apps Script berhasil disimpan.', 'success');
  };

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    showToast('Pengaturan Disimpan', 'Informasi perusahaan dan gaji berhasil diperbarui.', 'success');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    showToast('Kode Disalin!', 'Script Google Apps Script siap ditempel di Google Sheet', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Pengaturan & Integrasi Google Spreadsheet
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi database Google Sheet utama, parameter perusahaan, dan rumus default
        </p>
      </div>

      {/* Box 1: Integrasi Google Apps Script (DATABASE UTAMA) */}
      <div className="bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                DATABASE UTAMA: GOOGLE SPREADSHEET
              </h3>
              <p className="text-xs text-slate-500">
                Data Karyawan (Sheet 1) & Penggajian (Sheet 2)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCodeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
          >
            <Code2 className="w-4 h-4" />
            <span>Lihat Script Google Sheet</span>
          </button>
        </div>

        {/* Input URL Web App */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            URL Google Apps Script Web App
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 h-11 px-3.5 rounded-[10px] bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-blue-600"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveApiUrl}
                className="h-11 px-4 rounded-[10px] bg-slate-900 hover:bg-black text-white text-xs font-semibold whitespace-nowrap"
              >
                Simpan URL
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !inputUrl}
                className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji...' : 'Test Koneksi'}</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Dapatkan URL ini setelah melakukan Deploy as Web App pada Google Apps Script Anda.
          </p>
        </div>

        {/* Status Koneksi */}
        {testStatus && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
              testStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{testStatus.message}</span>
          </div>
        )}

        {/* Sync Manual Action */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div>
            <p className="text-xs font-bold text-slate-800">Sinkronisasi & Fallback Cache</p>
            <p className="text-[11px] text-slate-500">
              Jika offline atau terjadi limit Google, sistem otomatis menggunakan cache aman lokal.
            </p>
          </div>
          <button
            onClick={() => fetchData()}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Box 2: Pengaturan Perusahaan & Default Gaji */}
      <form
        onSubmit={handleSaveCompanySettings}
        className="bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Profil & Parameter Penggajian</h3>
            <p className="text-xs text-slate-500">
              Data kop surat slip gaji, periode default, dan kontak HRD
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Perusahaan
            </label>
            <input
              type="text"
              required
              value={formData.namaPerusahaan}
              onChange={(e) => setFormData({ ...formData, namaPerusahaan: e.target.value })}
              className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Periode Penggajian Aktif / Default
            </label>
            <input
              type="text"
              required
              value={formData.periodeAktif}
              onChange={(e) => setFormData({ ...formData, periodeAktif: e.target.value })}
              className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-600 outline-none font-semibold text-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Alamat Perusahaan
          </label>
          <input
            type="text"
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-600 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Petugas HRD / Admin
            </label>
            <input
              type="text"
              value={formData.namaAdmin}
              onChange={(e) => setFormData({ ...formData, namaAdmin: e.target.value })}
              className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nomor WhatsApp Admin / HRD
            </label>
            <input
              type="text"
              value={formData.noWhatsappAdmin}
              onChange={(e) => setFormData({ ...formData, noWhatsappAdmin: e.target.value })}
              className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-600 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Gaji Pokok Default (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.defaultGajiPokok}
              onChange={(e) =>
                setFormData({ ...formData, defaultGajiPokok: Number(e.target.value) || 0 })
              }
              className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tarif Denda Telat (Default: Rp 5 per kejadian)
            </label>
            <input
              type="number"
              min="0"
              value={formData.potonganTelatPerKejadian}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  potonganTelatPerKejadian: Number(e.target.value) || 5,
                })
              }
              className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-600 outline-none font-semibold text-rose-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">Sesuai formula: Telat × 5</p>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Box 3: Manajemen Periode & Sheet Spreadsheet Otomatis */}
      <div className="bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">Manajemen Periode & Sheet Spreadsheet</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Otomatis Sheet & Kolom
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tambah periode baru untuk membuat Tab Sheet baru, 17 kolom, dan rumus perhitungan otomatis di Google Spreadsheet
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPeriodeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Periode Baru</span>
          </button>
        </div>

        {/* Info callout */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Fitur Otomatisasi: </span>
            Setiap kali Anda menekan <em>"Tambah Periode Baru"</em>, sistem akan membuat Tab Sheet baru di Google Spreadsheet dengan nama unik (contoh: <code className="font-mono text-blue-600">GAJI_Sep_2026_M2</code>), menyiapkan 17 kolom lengkap beserta formula otomatis di kolom Total Gaji, dan menduplikasi daftar karyawan aktif sebagai draft siap diisi.
          </div>
        </div>

        {/* List of Periods */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Daftar Periode Tersedia ({periods.length})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {periods.map((item) => {
              const isActive = settings.periodeAktif === item.nama;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{item.nama}</h4>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          <Check className="w-3 h-3" />
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                        {item.sheetTabName || 'PENGGAJIAN'}
                      </span>
                      <span>•</span>
                      <span>{item.tipe || 'Mingguan'}</span>
                      {item.tanggalDibuat && (
                        <>
                          <span>•</span>
                          <span>Dibuat: {item.tanggalDibuat}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => setActivePeriode(item.nama)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-colors"
                      >
                        Set Aktif
                      </button>
                    )}
                    {periods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus periode "${item.nama}" dari daftar aplikasi?`)) {
                            deletePeriod(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus periode"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Tambah Periode */}
      <ModalTambahPeriode
        isOpen={showPeriodeModal}
        onClose={() => setShowPeriodeModal(false)}
      />

      {/* Code Modal: Google Apps Script Instruction */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Kode Google Apps Script untuk Google Spreadsheet
                </h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-4 text-xs text-slate-600">
              <div className="p-3.5 bg-blue-50 rounded-xl text-blue-800 space-y-1">
                <p className="font-bold">Langkah-langkah Memasang ke Google Sheet:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                  <li>Buka Google Spreadsheet yang ingin digunakan sebagai database.</li>
                  <li>Buka menu <b>Extensions</b> &gt; <b>Apps Script</b>.</li>
                  <li>Hapus kode default, lalu tempel kode lengkap di bawah ini.</li>
                  <li>Klik <b>Save</b> (ikon disket), lalu klik <b>Deploy</b> &gt; <b>New deployment</b>.</li>
                  <li>Pilih jenis <b>Web app</b>.</li>
                  <li>Atur <b>Execute as: Me</b> dan <b>Who has access: Anyone</b>.</li>
                  <li>Klik <b>Deploy</b>, salin <b>Web app URL</b>, lalu tempel di halaman Pengaturan ini.</li>
                </ol>
              </div>

              <div className="relative">
                <button
                  onClick={handleCopyCode}
                  className="absolute right-3 top-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin' : 'Salin Kode'}</span>
                </button>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-72">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
