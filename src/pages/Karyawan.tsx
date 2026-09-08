import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { EmployeeTable } from '../components/EmployeeTable';
import { EmployeeModal } from '../components/EmployeeModal';
import { Employee } from '../types';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { AlertCircle, Trash2 } from 'lucide-react';

export const KaryawanPage: React.FC = () => {
  const { employees, isLoading, addEmployee, updateEmployee, deleteEmployee, openSlipForEmployee } = usePayroll();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAddModal = () => {
    setSelectedEmployeeForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setSelectedEmployeeForEdit(emp);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Master Karyawan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar karyawan aktif terhubung Sheet 1 (KARYAWAN) di Google Spreadsheet
          </p>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <EmployeeTable
          employees={employees}
          onAddClick={handleOpenAddModal}
          onEditClick={handleOpenEditModal}
          onDeleteClick={handleDeleteRequest}
          onOpenSlip={openSlipForEmployee}
        />
      )}

      {/* Modal Add / Edit Employee */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          await addEmployee(data);
        }}
        onUpdate={async (data) => {
          await updateEmployee(data);
        }}
        editEmployee={selectedEmployeeForEdit}
        existingIds={employees.map((e) => e.id)}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hapus Data Karyawan?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus data <span className="font-semibold text-slate-800">{deleteTarget.name}</span> ({deleteTarget.id})? Tindakan ini akan menghapus baris di Google Spreadsheet.
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
                onClick={confirmDelete}
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
