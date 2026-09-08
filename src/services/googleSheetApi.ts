import { Employee, PayrollRecord, CompanySettings, PeriodItem } from '../types';
import { getApiUrl } from '../config/api';
import { initialEmployees, initialPayrolls, initialCompanySettings } from '../data/initialData';

const EMPLOYEES_STORAGE_KEY = 'gajiku_employees_data';
const PAYROLL_STORAGE_KEY = 'gajiku_payroll_data';
const SETTINGS_STORAGE_KEY = 'gajiku_settings_data';

// Helper load from local storage
export function getLocalEmployees(): Employee[] {
  if (typeof window === 'undefined') return initialEmployees;
  try {
    const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading employees from localStorage:', e);
  }
  return initialEmployees;
}

export function saveLocalEmployees(data: Employee[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(data));
  }
}

export function getLocalPayroll(): PayrollRecord[] {
  if (typeof window === 'undefined') return initialPayrolls;
  try {
    const raw = localStorage.getItem(PAYROLL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading payroll from localStorage:', e);
  }
  return initialPayrolls;
}

export function saveLocalPayroll(data: PayrollRecord[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(data));
  }
}

export function getLocalSettings(): CompanySettings {
  if (typeof window === 'undefined') return initialCompanySettings;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading settings from localStorage:', e);
  }
  return initialCompanySettings;
}

export function saveLocalSettings(data: CompanySettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
  }
}

/**
 * Service API Google Spreadsheet / Google Apps Script
 */
export const googleSheetApi = {
  /**
   * Tes koneksi ke URL Google Apps Script Web App
   */
  async testConnection(targetUrl?: string): Promise<{ success: boolean; message: string }> {
    const url = targetUrl || getApiUrl();
    if (!url) {
      return { success: false, message: 'URL Google Apps Script belum diisi.' };
    }

    try {
      const separator = url.includes('?') ? '&' : '?';
      const response = await fetch(`${url}${separator}action=getEmployees`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!response.ok) {
        return { success: false, message: `Server mengembalikan status HTTP ${response.status}` };
      }
      
      const resData = await response.json();
      if (resData && (resData.success !== false)) {
        return { success: true, message: 'Koneksi ke Google Spreadsheet berhasil terhubung!' };
      } else {
        return { success: false, message: resData.message || resData.error || 'Respon API tidak valid.' };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal menghubungi API: ${errorMsg}. Pastikan Deployment diset Who has access: Anyone.`,
      };
    }
  },

  /**
   * Mengambil semua data Karyawan (Sheet 1)
   */
  async getEmployees(): Promise<{ data: Employee[]; fromCloud: boolean }> {
    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}${separator}action=getEmployees`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && Array.isArray(json.data)) {
            saveLocalEmployees(json.data);
            return { data: json.data, fromCloud: true };
          }
        }
      } catch (err) {
        console.warn('Gagal memuat karyawan dari Google Sheet, memuat data lokal:', err);
      }
    }
    return { data: getLocalEmployees(), fromCloud: false };
  },

  /**
   * Mengambil semua data Penggajian (Sheet 2)
   */
  async getPayroll(): Promise<{ data: PayrollRecord[]; fromCloud: boolean }> {
    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}${separator}action=getPayroll`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && Array.isArray(json.data)) {
            saveLocalPayroll(json.data);
            return { data: json.data, fromCloud: true };
          }
        }
      } catch (err) {
        console.warn('Gagal memuat riwayat gaji dari Google Sheet, memuat data lokal:', err);
      }
    }
    return { data: getLocalPayroll(), fromCloud: false };
  },

  /**
   * Mengambil data slip berdasarkan token unik
   */
  async getSlipByToken(token: string): Promise<{ employee: Employee; payroll?: PayrollRecord } | null> {
    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}${separator}action=getSlip&token=${encodeURIComponent(token)}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data && json.data.employee) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Gagal fetch slip via API Google Sheet, mengecek lokal:', err);
      }
    }

    // Fallback ke data lokal
    const employees = getLocalEmployees();
    const emp = employees.find((e) => e.tokenAkses.trim() === token.trim() || e.id.toLowerCase() === token.toLowerCase());
    if (!emp) return null;

    const payrolls = getLocalPayroll();
    const pay = payrolls
      .filter((p) => p.employeeId === emp.id || p.nama.toLowerCase() === emp.nama.toLowerCase())
      .sort((a, b) => new Date(b.tanggalDibuat).getTime() - new Date(a.tanggalDibuat).getTime())[0];

    return { employee: emp, payroll: pay };
  },

  /**
   * Tambah Karyawan ke Sheet 1
   */
  async addEmployee(emp: Employee): Promise<{ success: boolean; message: string }> {
    // Selalu simpan lokal terlebih dahulu
    const current = getLocalEmployees();
    const updated = [emp, ...current];
    saveLocalEmployees(updated);

    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}${separator}action=addEmployee`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addEmployee', ...emp }),
        });
        const json = await res.json();
        return { success: true, message: json.message || 'Karyawan berhasil disimpan ke Google Spreadsheet' };
      } catch (err) {
        console.warn('Google Sheet write failed, saved locally:', err);
        return { success: true, message: 'Karyawan tersimpan di cache lokal (sinkronisasi cloud tertunda)' };
      }
    }
    return { success: true, message: 'Karyawan berhasil ditambahkan' };
  },

  /**
   * Update Karyawan di Sheet 1
   */
  async updateEmployee(emp: Employee): Promise<{ success: boolean; message: string }> {
    const current = getLocalEmployees();
    const updated = current.map((item) => (item.id === emp.id ? emp : item));
    saveLocalEmployees(updated);

    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        await fetch(`${apiUrl}${separator}action=updateEmployee`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'updateEmployee', ...emp }),
        });
      } catch (err) {
        console.warn('Update Google Sheet gagal, perubahan disimpan lokal:', err);
      }
    }
    return { success: true, message: 'Data karyawan berhasil diperbarui' };
  },

  /**
   * Hapus Karyawan dari Sheet 1
   */
  async deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
    const current = getLocalEmployees();
    const updated = current.filter((item) => item.id !== id);
    saveLocalEmployees(updated);

    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        await fetch(`${apiUrl}${separator}action=deleteEmployee`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'deleteEmployee', id }),
        });
      } catch (err) {
        console.warn('Hapus di Google Sheet gagal:', err);
      }
    }
    return { success: true, message: 'Karyawan berhasil dihapus' };
  },

  /**
   * Tambah Penggajian ke Sheet 2
   */
  async addPayroll(payroll: PayrollRecord): Promise<{ success: boolean; message: string }> {
    const current = getLocalPayroll();
    const updated = [payroll, ...current];
    saveLocalPayroll(updated);

    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}${separator}action=addPayroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addPayroll', ...payroll }),
        });
        const json = await res.json();
        return { success: true, message: json.message || 'Penggajian tersimpan di Google Spreadsheet' };
      } catch (err) {
        console.warn('Gagal menyimpan penggajian ke cloud, tersimpan di lokal:', err);
        return { success: true, message: 'Penggajian tersimpan di penyimpanan lokal' };
      }
    }
    return { success: true, message: 'Penggajian berhasil disimpan' };
  },

  /**
   * Update Penggajian di Sheet 2
   */
  async updatePayroll(payroll: PayrollRecord): Promise<{ success: boolean; message: string }> {
    const current = getLocalPayroll();
    const updated = current.map((item) => (item.id === payroll.id ? payroll : item));
    saveLocalPayroll(updated);

    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        await fetch(`${apiUrl}${separator}action=updatePayroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'updatePayroll', ...payroll }),
        });
      } catch (err) {
        console.warn('Gagal update payroll ke Google Sheet:', err);
      }
    }
    return { success: true, message: 'Penggajian berhasil diperbarui' };
  },

  /**
   * Update komentar pada data penggajian & slip di Google Sheet
   */
  async updateComment(
    payrollId: string,
    komentar: string,
    periode?: string
  ): Promise<{ success: boolean; message: string }> {
    const current = getLocalPayroll();
    let foundRecord: PayrollRecord | null = null;
    const updated = current.map((item) => {
      if (item.id === payrollId || (periode && item.id.includes(payrollId) && item.periode === periode)) {
        foundRecord = { ...item, komentar };
        return foundRecord;
      }
      return item;
    });
    saveLocalPayroll(updated);

    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}${separator}action=updateComment`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'updateComment',
            id: payrollId,
            komentar,
            periode: foundRecord?.periode || periode || '',
          }),
        });
        const json = await res.json();
        return { success: true, message: json.message || 'Komentar berhasil disimpan ke Google Spreadsheet' };
      } catch (err) {
        console.warn('Gagal update komentar di Google Sheet, disimpan lokal:', err);
        return { success: true, message: 'Komentar tersimpan di penyimpanan lokal' };
      }
    }
    return { success: true, message: 'Komentar berhasil disimpan' };
  },

  /**
   * Hapus Penggajian dari Sheet 2
   */
  async deletePayroll(id: string): Promise<{ success: boolean; message: string }> {
    const current = getLocalPayroll();
    const updated = current.filter((item) => item.id !== id);
    saveLocalPayroll(updated);

    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        await fetch(`${apiUrl}${separator}action=deletePayroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'deletePayroll', id }),
        });
      } catch (err) {
        console.warn('Gagal menghapus penggajian di Google Sheet:', err);
      }
    }
    return { success: true, message: 'Data penggajian berhasil dihapus' };
  },

  /**
   * Mengambil daftar periode dari Sheet DAFTAR_PERIODE
   */
  async getPeriods(): Promise<{ data: PeriodItem[]; fromCloud: boolean }> {
    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}${separator}action=getPeriods`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
            const settings = getLocalSettings();
            saveLocalSettings({ ...settings, daftarPeriode: json.data });
            return { data: json.data, fromCloud: true };
          }
        }
      } catch (err) {
        console.warn('Gagal memuat periode dari Google Sheet, menggunakan data lokal:', err);
      }
    }
    const local = getLocalSettings();
    return { data: local.daftarPeriode || initialCompanySettings.daftarPeriode || [], fromCloud: false };
  },

  /**
   * Tambah Periode Baru ke Spreadsheet (Otomatis Buat Sheet Tab Baru, Kolom-Kolom & Formula)
   */
  async addPeriod(
    period: PeriodItem,
    populateEmployees: boolean = true,
    setAsActive: boolean = true
  ): Promise<{ success: boolean; message: string; fromCloud?: boolean; data?: any }> {
    // 1. Simpan ke local settings & local payroll records
    const settings = getLocalSettings();
    const existingPeriods = settings.daftarPeriode || initialCompanySettings.daftarPeriode || [];
    const isAlreadyExist = existingPeriods.some(
      (p) => p.id === period.id || p.nama.toLowerCase() === period.nama.toLowerCase()
    );

    const updatedPeriods = isAlreadyExist
      ? existingPeriods.map((p) => (p.id === period.id ? period : p))
      : [period, ...existingPeriods];

    saveLocalSettings({
      ...settings,
      periodeAktif: setAsActive ? period.nama : settings.periodeAktif,
      daftarPeriode: updatedPeriods,
    });

    // Jika populateEmployees lokal: buat draft payroll records untuk periode baru
    if (populateEmployees) {
      const employees = getLocalEmployees();
      const currentPayroll = getLocalPayroll();
      const newDrafts: PayrollRecord[] = [];

      employees.forEach((emp) => {
        if (emp.status !== 'Nonaktif') {
          const isBorongan = emp.jabatan.toLowerCase().includes('borongan');
          const isKoor = emp.jabatan.toLowerCase().includes('koor');
          const tipeGaji = isBorongan ? 'Borongan' : 'Harian';
          const hadir = isBorongan ? 1 : 6;
          const gajiPokok = isBorongan ? 500000 : 100000;
          const bonusKoor1 = isKoor ? 100000 : 0;
          const total = isBorongan ? gajiPokok + bonusKoor1 : hadir * gajiPokok + bonusKoor1;

          newDrafts.push({
            id: `PAY-${emp.id}-${period.id}`,
            employeeId: emp.id,
            nama: emp.nama,
            tipeGaji,
            hadir,
            gajiPokok,
            lembur: 0,
            bonusKoor1,
            bonusKoor2: 0,
            bonus1: 0,
            bonus2: 0,
            bonus3: 0,
            telat: 0,
            gajiDiambil: 0,
            total,
            keterangan: `Draft Periode ${period.nama}`,
            periode: period.nama,
            tanggalDibuat: new Date().toISOString().split('T')[0],
          });
        }
      });

      if (newDrafts.length > 0) {
        saveLocalPayroll([...newDrafts, ...currentPayroll]);
      }
    }

    // 2. Kirim ke Google Apps Script Spreadsheet Web App
    const apiUrl = getApiUrl();
    if (apiUrl) {
      try {
        const separator = apiUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}${separator}action=addPeriod`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'addPeriod',
            ...period,
            populateEmployees,
            setAsActive,
          }),
        });
        const json = await res.json();
        return {
          success: true,
          message:
            json.message ||
            `Tab Sheet '${period.sheetTabName || period.nama}' berhasil dibuat di Google Spreadsheet dengan kolom lengkap & formula!`,
          fromCloud: true,
          data: json.data,
        };
      } catch (err) {
        console.warn('Google Sheet addPeriod error, disimpan di lokal:', err);
        return {
          success: true,
          message: `Periode '${period.nama}' berhasil dibuat & disimpan ke sistem lokal (akan disinkronkan ke Spreadsheet saat terhubung).`,
          fromCloud: false,
        };
      }
    }

    return {
      success: true,
      message: `Periode '${period.nama}' berhasil ditambahkan ke sistem. Tab sheet dan kolom siap disinkronkan ke Google Spreadsheet.`,
      fromCloud: false,
    };
  },
};
