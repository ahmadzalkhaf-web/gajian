export type TipeGaji = 'Harian' | 'Borongan';
export type StatusKaryawan = 'Aktif' | 'Nonaktif';
export type UserRole = 'ADMIN' | 'KARYAWAN';

export type DivisiKaryawan = 'Apparel' | 'Distro' | 'Jersey' | 'Hijab' | 'Scarf';
export const DAFTAR_DIVISI: DivisiKaryawan[] = ['Apparel', 'Distro', 'Jersey', 'Hijab', 'Scarf'];

export interface Employee {
  id: string; // EMP001, EMP002, etc.
  nama: string;
  noWhatsapp: string;
  noRekening: string;
  namaBank: string;
  jabatan: string;
  divisi?: DivisiKaryawan;
  status: StatusKaryawan;
  tanggalBergabung: string;
  linkSlip: string;
  tokenAkses: string;
}

export interface PayrollRecord {
  id: string; // PAY001 or EMP ID ref
  employeeId: string;
  nama: string;
  tipeGaji: TipeGaji;
  divisi?: DivisiKaryawan;
  hadir: number;
  gajiPokok: number;
  lembur: number;
  bonusKoor1: number;
  bonusKoor2: number;
  bonus1: number;
  bonus2: number;
  bonus3: number;
  telat: number; // potongan telat = telat * 5
  gajiDiambil: number; // Gaji diambil dalam 1 minggu
  total: number;
  keterangan: string;
  komentar?: string;
  periode: string;
  tanggalDibuat: string;
}

export interface PayrollCalculationInput {
  tipeGaji: TipeGaji;
  hadir: number;
  gajiPokok: number;
  lembur: number;
  bonusKoor1: number;
  bonusKoor2: number;
  bonus1: number;
  bonus2: number;
  bonus3: number;
  telat: number;
  gajiDiambil: number;
}

export interface PayrollCalculationResult {
  gajiUtama: number;
  lemburNominal: number;
  totalBonus: number;
  totalPotongan: number;
  total: number;
  breakdown: {
    potonganTelat: number;
    potonganGajiDiambil: number;
  };
}

export interface PeriodItem {
  id: string; // e.g. "2026-09-M1", "2026-09-M2"
  nama: string; // "September 2026 Minggu 1"
  tipe: 'Mingguan' | 'Bulanan';
  bulan: string; // "September"
  tahun: string; // "2026"
  mingguKe?: number; // 1, 2, 3, 4, 5
  tanggalMulai?: string;
  tanggalSelesai?: string;
  sheetTabName?: string; // "GAJI_Sep_2026_M1"
  status: 'Aktif' | 'Arsip';
  tanggalDibuat: string;
}

export interface CompanySettings {
  namaPerusahaan: string;
  logoPerusahaan: string;
  alamat: string;
  noWhatsappAdmin: string;
  namaAdmin: string;
  tahun: string;
  periodeAktif: string;
  daftarPeriode?: PeriodItem[];
  defaultGajiPokok?: number;
  potonganTelatPerKejadian?: number;
  googleAppsScriptUrl?: string;
  spreadsheetId?: string;
  lastSyncTime?: string;
}

export interface AuthState {
  role: UserRole;
  employeeId?: string;
  employeeName?: string;
  isAuthenticated: boolean;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
