import * as XLSX from 'xlsx';
import { PayrollRecord } from '../types';

export interface ExportFilterOptions {
  periode?: string;
  employeeId?: string;
}

export function filterPayrollData(
  data: PayrollRecord[],
  options?: ExportFilterOptions
): PayrollRecord[] {
  return data.filter((item) => {
    if (options?.periode && options.periode !== 'Semua Periode' && item.periode !== options.periode) {
      return false;
    }
    if (options?.employeeId && options.employeeId !== 'Semua Karyawan' && item.employeeId !== options.employeeId) {
      return false;
    }
    return true;
  });
}

function mapToExportRows(data: PayrollRecord[]) {
  return data.map((row) => ({
    ID: row.id,
    Nama: row.nama,
    Divisi: row.divisi || 'Apparel',
    'Tipe Gaji': row.tipeGaji,
    Hadir: row.hadir,
    'Gaji Pokok': row.gajiPokok,
    Lembur: row.lembur,
    'Bonus Koor 1': row.bonusKoor1,
    'Bonus Koor 2': row.bonusKoor2,
    'Bonus 1': row.bonus1,
    'Bonus 2': row.bonus2,
    'Bonus 3': row.bonus3,
    Telat: row.telat,
    'Gaji Diambil': row.gajiDiambil,
    Total: row.total,
    Keterangan: row.keterangan || '',
    Note: row.komentar || '',
    Periode: row.periode,
    'Tanggal Dibuat': row.tanggalDibuat,
  }));
}

/**
 * Export ke file Excel (.xlsx) dengan Sheet PENGGAJIAN
 */
export function exportToExcel(data: PayrollRecord[], filename = 'Laporan_Penggajian_GAJIKU.xlsx'): void {
  const exportRows = mapToExportRows(data);
  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  // Styling column widths
  worksheet['!cols'] = [
    { wch: 10 }, // ID
    { wch: 22 }, // Nama
    { wch: 12 }, // Tipe Gaji
    { wch: 8 },  // Hadir
    { wch: 14 }, // Gaji Pokok
    { wch: 10 }, // Lembur
    { wch: 14 }, // Bonus Koor 1
    { wch: 14 }, // Bonus Koor 2
    { wch: 12 }, // Bonus 1
    { wch: 12 }, // Bonus 2
    { wch: 12 }, // Bonus 3
    { wch: 8 },  // Telat
    { wch: 14 }, // Gaji Diambil
    { wch: 16 }, // Total
    { wch: 25 }, // Keterangan
    { wch: 20 }, // Periode
    { wch: 14 }, // Tanggal
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PENGGAJIAN');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export ke format CSV
 */
export function exportToCSV(data: PayrollRecord[], filename = 'Laporan_Penggajian_GAJIKU.csv'): void {
  const exportRows = mapToExportRows(data);
  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
