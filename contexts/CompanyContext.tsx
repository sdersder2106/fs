'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Company {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT';
  companyId?: string;
}

interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  isLoading: boolean;
  userRole: 'ADMIN' | 'CLIENT' | null;
  userCompanyId: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: React.ReactNode;
  user?: User | null; // User from session
}

export function CompanyProvider({ children, user }: CompanyProviderProps) {
  const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userRole = user?.role || null;
  const userCompanyId = user?.companyId || null;

  // For CLIENT users, auto-select their company
  useEffect(() => {
    if (userRole === 'CLIENT' && userCompanyId && companies.length > 0) {
      const userCompany = companies.find((c) => c.id === userCompanyId);
      if (userCompany) {
        setSelectedCompanyState(userCompany);
        setIsLoading(false);
      }
    }
  }, [userRole, userCompanyId, companies]);

  // For ADMIN users, load from localStorage
  useEffect(() => {
    if (userRole === 'ADMIN' && companies.length > 0) {
      const storedCompanyId = localStorage.getItem('selectedCompanyId');
      if (storedCompanyId) {
        const company = companies.find((c) => c.id === storedCompanyId);
        if (company) {
          setSelectedCompanyState(company);
        }
      }
      setIsLoading(false);
    }
  }, [userRole, companies]);

  // Save selected company to localStorage (ADMIN only)
  const setSelectedCompany = (company: Company | null) => {
    if (userRole !== 'ADMIN') {
      // Clients cannot change company
      return;
    }
    
    setSelectedCompanyState(company);
    if (company) {
      localStorage.setItem('selectedCompanyId', company.id);
    } else {
      localStorage.removeItem('selectedCompanyId');
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany,
        companies,
        setCompanies,
        isLoading,
        userRole,
        userCompanyId,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

