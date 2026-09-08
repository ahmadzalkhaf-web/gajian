import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Employee, PayrollRecord, CompanySettings, PeriodItem } from '../types';
import { googleSheetApi, getLocalSettings, saveLocalSettings } from '../services/googleSheetApi';
import { generateNextEmployeeId, generateSlipToken, generateSlipLink } from '../utils/generateToken';
import { useToast } from './ToastContext';
import { getApiUrl, setApiUrl as saveApiUrlConfig } from '../config/api';
import { initialCompanySettings } from '../data/initialData';

export type PageName = 'dashboard' | 'karyawan' | 'penggajian' | 'riwayat' | 'laporan' | 'pengaturan' | 'slip';

interface PayrollContextType {
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  settings: CompanySettings;
  periods: PeriodItem[];
  isLoading: boolean;
  isSyncing: boolean;
  isCloudConnected: boolean;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  testConnection: (url?: string) => Promise<boolean>;
  activePage: PageName;
  setActivePage: (page: PageName) => void;
  selectedSlipRecord: PayrollRecord | null;
  setSelectedSlipRecord: (record: PayrollRecord | null) => void;
  selectedEmployeeForSlip: Employee | null;
  setSelectedEmployeeForSlip: (emp: Employee | null) => void;
  selectedSlipEmployee: Employee | null;
  selectedSlipPayroll: PayrollRecord | null;
  fetchData: () => Promise<void>;
  addEmployee: (empData: Omit<Employee, 'id' | 'tokenAkses' | 'linkSlip'>) => Promise<Employee>;
  updateEmployee: (emp: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addPayroll: (record: Omit<PayrollRecord, 'id' | 'tanggalDibuat'>) => Promise<void>;
  updatePayroll: (record: PayrollRecord) => Promise<void>;
  updatePayrollComment: (payrollId: string, komentar: string) => Promise<void>;
  deletePayroll: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  openSlipForEmployee: (emp: Employee) => void;
  openSlipForRecord: (record: PayrollRecord) => void;
  addPeriod: (
    periodData: Omit<PeriodItem, 'id' | 'tanggalDibuat'>,
    autoPopulateEmployees?: boolean,
    setAsActive?: boolean
  ) => Promise<{ success: boolean; message: string; fromCloud?: boolean }>;
  setActivePeriode: (name: string) => void;
  deletePeriod: (id: string) => Promise<void>;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export const PayrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(getLocalSettings);
  const [periods, setPeriods] = useState<PeriodItem[]>(() => {
    const local = getLocalSettings();
    return local.daftarPeriode && local.daftarPeriode.length > 0
      ? local.daftarPeriode
      : initialCompanySettings.daftarPeriode || [];
  });
  const [apiUrlState, setApiUrlState] = useState<string>(getApiUrl());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<PageName>('dashboard');
  
  const [selectedSlipRecord, setSelectedSlipRecord] = useState<PayrollRecord | null>(null);
  const [selectedEmployeeForSlip, setSelectedEmployeeForSlip] = useState<Employee | null>(null);

  const { showToast } = useToast();

  const handleSetApiUrl = (url: string) => {
    saveApiUrlConfig(url);
    setApiUrlState(url);
  };

  const handleTestConnection = async (url?: string): Promise<boolean> => {
    const res = await googleSheetApi.testConnection(url || apiUrlState);
    return res.success;
  };

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [empRes, payRes, periodRes] = await Promise.all([
        googleSheetApi.getEmployees(),
        googleSheetApi.getPayroll(),
        googleSheetApi.getPeriods(),
      ]);

      setEmployees(empRes.data);
      setPayrollRecords(payRes.data);
      if (periodRes.data && periodRes.data.length > 0) {
        setPeriods(periodRes.data);
      }
      setIsCloudConnected(empRes.fromCloud && payRes.fromCloud);

      if (empRes.fromCloud || payRes.fromCloud) {
        showToast('Sinkronisasi Berhasil', 'Data berhasil diperbarui dari Google Spreadsheet', 'success');
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      showToast('Data gagal dimuat', 'Menggunakan data penyimpanan lokal', 'warning');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check URL token for direct slip view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('slip');
      if (token && employees.length > 0) {
        const emp = employees.find(e => e.tokenAkses.trim() === token.trim() || e.id.toLowerCase() === token.toLowerCase());
        if (emp) {
          const rec = payrollRecords
            .filter(p => p.employeeId === emp.id || p.nama.toLowerCase() === emp.nama.toLowerCase())
            .sort((a, b) => new Date(b.tanggalDibuat).getTime() - new Date(a.tanggalDibuat).getTime())[0];
          setSelectedEmployeeForSlip(emp);
          setSelectedSlipRecord(rec || null);
          setActivePage('slip');
        }
      }
    }
  }, [employees, payrollRecords]);

  const addEmployee = async (empData: Omit<Employee, 'id' | 'tokenAkses' | 'linkSlip'>): Promise<Employee> => {
    const existingIds = employees.map(e => e.id);
    const newId = generateNextEmployeeId(existingIds);
    const token = generateSlipToken();
    const link = generateSlipLink(token);

    const newEmp: Employee = {
      ...empData,
      id: newId,
      tokenAkses: token,
      linkSlip: link,
    };

    setEmployees(prev => [newEmp, ...prev]);
    const res = await googleSheetApi.addEmployee(newEmp);
    showToast('Berhasil menyimpan data', res.message, 'success');
    return newEmp;
  };

  const updateEmployee = async (emp: Employee) => {
    setEmployees(prev => prev.map(item => item.id === emp.id ? emp : item));
    const res = await googleSheetApi.updateEmployee(emp);
    showToast('Berhasil memperbarui data', res.message, 'success');
  };

  const deleteEmployee = async (id: string) => {
    setEmployees(prev => prev.filter(item => item.id !== id));
    const res = await googleSheetApi.deleteEmployee(id);
    showToast('Berhasil menghapus data', res.message, 'success');
  };

  const addPayroll = async (recordData: Omit<PayrollRecord, 'id' | 'tanggalDibuat'>) => {
    const nextNum = payrollRecords.length + 1;
    const newId = `PAY-${nextNum.toString().padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newRecord: PayrollRecord = {
      ...recordData,
      id: newId,
      tanggalDibuat: today,
    };

    setPayrollRecords(prev => [newRecord, ...prev]);
    const res = await googleSheetApi.addPayroll(newRecord);
    showToast('Berhasil menyimpan data penggajian', res.message, 'success');
  };

  const updatePayroll = async (record: PayrollRecord) => {
    setPayrollRecords(prev => prev.map(item => item.id === record.id ? record : item));
    const res = await googleSheetApi.updatePayroll(record);
    showToast('Berhasil memperbarui penggajian', res.message, 'success');
  };

  const updatePayrollComment = async (payrollId: string, komentar: string) => {
    setPayrollRecords(prev =>
      prev.map(item => {
        if (item.id === payrollId || item.employeeId === payrollId) {
          return { ...item, komentar };
        }
        return item;
      })
    );

    setSelectedSlipRecord(prev => {
      if (prev && (prev.id === payrollId || prev.employeeId === payrollId)) {
        return { ...prev, komentar };
      }
      return prev;
    });

    const res = await googleSheetApi.updateComment(payrollId, komentar, selectedSlipRecord?.periode);
    showToast('Komentar Disimpan', res.message, 'success');
  };

  const deletePayroll = async (id: string) => {
    setPayrollRecords(prev => prev.filter(item => item.id !== id));
    const res = await googleSheetApi.deletePayroll(id);
    showToast('Berhasil menghapus data', res.message, 'success');
  };

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveLocalSettings(updated);
    showToast('Pengaturan Disimpan', 'Pengaturan sistem berhasil diperbarui', 'success');
  };

  const openSlipForEmployee = (emp: Employee) => {
    const latest = payrollRecords
      .filter(p => p.employeeId === emp.id || p.nama.toLowerCase() === emp.nama.toLowerCase())
      .sort((a, b) => new Date(b.tanggalDibuat).getTime() - new Date(a.tanggalDibuat).getTime())[0];
    
    setSelectedEmployeeForSlip(emp);
    setSelectedSlipRecord(latest || null);
    setActivePage('slip');
  };

  const openSlipForRecord = (record: PayrollRecord) => {
    const emp = employees.find(e => e.id === record.employeeId || e.nama.toLowerCase() === record.nama.toLowerCase());
    setSelectedEmployeeForSlip(emp || {
      id: record.employeeId || record.id,
      nama: record.nama,
      noWhatsapp: '',
      noRekening: '',
      namaBank: '',
      jabatan: 'Karyawan',
      status: 'Aktif',
      tanggalBergabung: '',
      tokenAkses: 'SLIP-ACCESS',
      linkSlip: generateSlipLink('SLIP-ACCESS'),
    });
    setSelectedSlipRecord(record);
    setActivePage('slip');
  };

  const addPeriod = async (
    periodData: Omit<PeriodItem, 'id' | 'tanggalDibuat'>,
    autoPopulateEmployees: boolean = true,
    setAsActive: boolean = true
  ): Promise<{ success: boolean; message: string; fromCloud?: boolean }> => {
    const nextId = `PER-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newPeriod: PeriodItem = {
      ...periodData,
      id: nextId,
      tanggalDibuat: today,
    };

    const updatedPeriods = [newPeriod, ...periods.filter(p => p.id !== nextId)];
    setPeriods(updatedPeriods);

    if (setAsActive) {
      const updatedSettings: CompanySettings = {
        ...settings,
        periodeAktif: newPeriod.nama,
        daftarPeriode: updatedPeriods,
      };
      setSettings(updatedSettings);
      saveLocalSettings(updatedSettings);
    } else {
      const updatedSettings: CompanySettings = {
        ...settings,
        daftarPeriode: updatedPeriods,
      };
      setSettings(updatedSettings);
      saveLocalSettings(updatedSettings);
    }

    const res = await googleSheetApi.addPeriod(newPeriod, autoPopulateEmployees, setAsActive);
    
    // Refresh payroll so drafts appear in list
    const payRes = await googleSheetApi.getPayroll();
    setPayrollRecords(payRes.data);

    showToast(
      res.fromCloud ? 'Tab Sheet Dibuat di Google Spreadsheet' : 'Periode Berhasil Dibuat',
      res.message,
      res.success ? 'success' : 'warning'
    );

    return res;
  };

  const setActivePeriode = (name: string) => {
    const updated: CompanySettings = { ...settings, periodeAktif: name };
    setSettings(updated);
    saveLocalSettings(updated);
    showToast('Periode Aktif Diubah', `Periode aktif saat ini: ${name}`, 'info');
  };

  const deletePeriod = async (id: string) => {
    const updated = periods.filter(p => p.id !== id);
    setPeriods(updated);
    const updatedSettings: CompanySettings = { ...settings, daftarPeriode: updated };
    setSettings(updatedSettings);
    saveLocalSettings(updatedSettings);
    showToast('Periode Dihapus', 'Periode berhasil dihapus dari daftar.', 'success');
  };

  return (
    <PayrollContext.Provider
      value={{
        employees,
        payrollRecords,
        settings,
        periods,
        isLoading,
        isSyncing,
        isCloudConnected,
        apiUrl: apiUrlState,
        setApiUrl: handleSetApiUrl,
        testConnection: handleTestConnection,
        activePage,
        setActivePage,
        selectedSlipRecord,
        setSelectedSlipRecord,
        selectedEmployeeForSlip,
        setSelectedEmployeeForSlip,
        selectedSlipEmployee: selectedEmployeeForSlip,
        selectedSlipPayroll: selectedSlipRecord,
        fetchData,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addPayroll,
        updatePayroll,
        updatePayrollComment,
        deletePayroll,
        updateSettings,
        openSlipForEmployee,
        openSlipForRecord,
        addPeriod,
        setActivePeriode,
        deletePeriod,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export function usePayroll() {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
}
