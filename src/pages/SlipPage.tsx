import React, { useState, useMemo } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { useAuth } from '../context/AuthContext';
import { SlipGaji } from '../components/SlipGaji';
import { EmptyState } from '../components/EmptyState';
import {
  FileText,
  ArrowLeft,
  ChevronDown,
  User,
  Calendar
} from 'lucide-react';
import { Employee, PayrollRecord } from '../types';

export const SlipPage: React.FC = () => {
  const {
    employees,
    payrollRecords,
    settings,
    selectedSlipEmployee,
    selectedEmployeeForSlip,
    selectedSlipRecord,
    openSlipForEmployee,
    openSlipForRecord,
    setActivePage,
  } = usePayroll();

  const { role, employee: currentEmployee } = useAuth();

  // Active target employee - defaults to selected or current or first with payroll or first employee
  const defaultEmployee = useMemo(() => {
    if (currentEmployee) return currentEmployee;
    if (selectedEmployeeForSlip) return selectedEmployeeForSlip;
    if (selectedSlipEmployee) return selectedSlipEmployee;

    // Find first employee who has payroll records
    if (payrollRecords.length > 0) {
      const firstWithRecord = employees.find(
        (e) => payrollRecords.some((p) => p.employeeId === e.id || p.nama.toLowerCase() === e.nama.toLowerCase())
      );
      if (firstWithRecord) return firstWithRecord;
    }
    return employees[0] || null;
  }, [currentEmployee, selectedEmployeeForSlip, selectedSlipEmployee, employees, payrollRecords]);

  const [manualSelectedEmpId, setManualSelectedEmpId] = useState<string | null>(null);

  const targetEmployee: Employee | null = useMemo(() => {
    if (manualSelectedEmpId) {
      const found = employees.find((e) => e.id === manualSelectedEmpId);
      if (found) return found;
    }
    return defaultEmployee;
  }, [manualSelectedEmpId, defaultEmployee, employees]);

  // Employee's payroll records (all periods for this employee)
  const employeePayrolls = useMemo(() => {
    if (!targetEmployee) return [];
    return payrollRecords
      .filter(
        (p) =>
          p.employeeId === targetEmployee.id ||
          p.nama.trim().toLowerCase() === targetEmployee.nama.trim().toLowerCase()
      )
      .sort((a, b) => new Date(b.tanggalDibuat).getTime() - new Date(a.tanggalDibuat).getTime());
  }, [targetEmployee, payrollRecords]);

  // Selected payroll record for active slip
  const [manualSelectedPayrollId, setManualSelectedPayrollId] = useState<string | null>(null);

  const activePayroll: PayrollRecord | null = useMemo(() => {
    if (manualSelectedPayrollId) {
      const matched = employeePayrolls.find((p) => p.id === manualSelectedPayrollId);
      if (matched) return matched;
    }
    if (
      selectedSlipRecord &&
      targetEmployee &&
      (selectedSlipRecord.employeeId === targetEmployee.id ||
        selectedSlipRecord.nama.toLowerCase() === targetEmployee.nama.toLowerCase())
    ) {
      return selectedSlipRecord;
    }
    return employeePayrolls[0] || null;
  }, [manualSelectedPayrollId, selectedSlipRecord, targetEmployee, employeePayrolls]);

  if (!targetEmployee) {
    return (
      <EmptyState
       
        title="Belum Ada Data Karyawan"
        description="Silakan tambahkan data karyawan terlebih dahulu untuk mencetak slip gaji."
        actionText="Kembali ke Dashboard"
        onAction={() => setActivePage('dashboard')}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Selector Mini Bar (Print Hidden) - Memudahkan Admin Memilih Karyawan/Periode Tanpa Mengganggu Tampilan Slip */}
      {role === 'ADMIN' && (
        <div className="print:hidden bg-white border border-slate-200/90 rounded-[14px] px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={() => setActivePage('riwayat')}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Riwayat / Menu</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pilih Karyawan */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Karyawan:</span>
              <select
                value={targetEmployee.id}
                onChange={(e) => {
                  setManualSelectedEmpId(e.target.value);
                  setManualSelectedPayrollId(null);
                }}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nama} ({emp.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Pilih Periode jika ada lebih dari 1 */}
            {employeePayrolls.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Periode:</span>
                <select
                  value={activePayroll?.id || ''}
                  onChange={(e) => setManualSelectedPayrollId(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-blue-700 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {employeePayrolls.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.periode}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dokumen Slip Gaji Murni Tanpa Menu Lainnya */}
      <SlipGaji
        employee={targetEmployee}
        payroll={activePayroll}
        settings={settings}
        onBack={role === 'ADMIN' ? () => setActivePage('riwayat') : undefined}
      />
    </div>
  );
};
