'use client';

import React, { useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Building2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CompanySelector() {
  const { 
    selectedCompany, 
    setSelectedCompany, 
    companies, 
    setCompanies, 
    isLoading,
    userRole 
  } = useCompany();

  // Fetch companies on mount (ADMIN only)
  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetchCompanies();
    }
  }, [userRole]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        
        // Auto-select first company if none selected
        if (data.length > 0 && !selectedCompany) {
          setSelectedCompany(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  // Don't render for CLIENT users
  if (userRole !== 'ADMIN') {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg animate-pulse">
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
        <div className="w-32 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // No companies available
  if (companies.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
        <Building2 className="w-4 h-4" />
        <span>No companies available</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Select Company
      </label>
      <div className="relative">
        <select
          value={selectedCompany?.id || ''}
          onChange={(e) => {
            const company = companies.find((c) => c.id === e.target.value);
            if (company) {
              setSelectedCompany(company);
            }
          }}
          className={cn(
            "w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg",
            "text-sm font-medium text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "cursor-pointer appearance-none",
            "hover:border-gray-400 transition-colors"
          )}
        >
          <option value="" disabled>
            Select a company...
          </option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        
        {/* Building icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Building2 className="w-5 h-5 text-gray-400" />
        </div>
        
        {/* Chevron icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      {/* Selected company info */}
      {selectedCompany && (
        <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-medium text-blue-700">
              Viewing data for: {selectedCompany.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
