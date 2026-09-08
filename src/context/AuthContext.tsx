import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Employee } from '../types';
import { getLocalEmployees } from '../services/googleSheetApi';

interface AuthContextType {
  role: UserRole;
  employee?: Employee | null;
  setAdminRole: () => void;
  setEmployeeRole: (emp: Employee) => void;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Check URL query parameters for direct token access: ?slip=TOKEN or ?emp=EMP001
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const slipToken = params.get('slip');
      if (slipToken) {
        const emps = getLocalEmployees();
        const found = emps.find(e => e.tokenAkses === slipToken || e.id.toLowerCase() === slipToken.toLowerCase());
        if (found) {
          setRole('KARYAWAN');
          setEmployee(found);
        }
      }
    }
  }, []);

  const setAdminRole = () => {
    setRole('ADMIN');
    setEmployee(null);
  };

  const setEmployeeRole = (emp: Employee) => {
    setRole('KARYAWAN');
    setEmployee(emp);
  };

  const logout = () => {
    // When logging out, revert to Admin or show role select
    setRole('ADMIN');
    setEmployee(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        employee,
        setAdminRole,
        setEmployeeRole,
        logout,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
