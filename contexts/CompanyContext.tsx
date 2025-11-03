'use client';

import React from 'react';

interface Company {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  description?: string;
}

interface CompanyContextType {
  currentCompany: Company | null;
  companies: Company[];
  setCurrentCompany: (company: Company) => void;
  switchCompany: (companyId: string) => void;
  refreshCompanies: () => Promise<void>;
  loading: boolean;
}

const CompanyContext = React.createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = React.useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: React.ReactNode;
  initialCompanyId?: string;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({
  children,
  initialCompanyId,
}) => {
  const [currentCompany, setCurrentCompany] = React.useState<Company | null>(null);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchCompanies = React.useCallback(async () => {
    try {
      setLoading(true);
      // Fetch companies from API
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data || []);
        
        // Set initial company
        if (data.data && data.data.length > 0) {
          const targetCompany = initialCompanyId
            ? data.data.find((c: Company) => c.id === initialCompanyId)
            : data.data[0];
          
          if (targetCompany) {
            setCurrentCompany(targetCompany);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  }, [initialCompanyId]);

  React.useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const switchCompany = React.useCallback((companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      // Save to localStorage for persistence
      localStorage.setItem('selectedCompanyId', companyId);
    }
  }, [companies]);

  const value = React.useMemo(
    () => ({
      currentCompany,
      companies,
      setCurrentCompany,
      switchCompany,
      refreshCompanies: fetchCompanies,
      loading,
    }),
    [currentCompany, companies, switchCompany, fetchCompanies, loading]
  );

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;
