'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Building, Check, ChevronDown, Plus } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo?: string;
  domain?: string;
}

interface CompanySelectorProps {
  companies: Company[];
  currentCompanyId: string;
  onCompanyChange: (companyId: string) => void;
  onAddCompany?: () => void;
  className?: string;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  currentCompanyId,
  onCompanyChange,
  onAddCompany,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const currentCompany = companies.find(c => c.id === currentCompanyId);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentCompany) {
    return null;
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <div className="flex items-center space-x-3">
          {currentCompany.logo ? (
            <img
              src={currentCompany.logo}
              alt={currentCompany.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {currentCompany.name}
            </p>
            {currentCompany.domain && (
              <p className="text-xs text-gray-500">{currentCompany.domain}</p>
            )}
          </div>
        </div>
        <ChevronDown 
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Companies
            </div>
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => {
                  onCompanyChange(company.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 text-left hover:bg-gray-50',
                  company.id === currentCompanyId && 'bg-primary-50'
                )}
              >
                <div className="flex items-center space-x-3">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {company.name}
                    </p>
                    {company.domain && (
                      <p className="text-xs text-gray-500">{company.domain}</p>
                    )}
                  </div>
                </div>
                {company.id === currentCompanyId && (
                  <Check className="w-4 h-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
          
          {onAddCompany && (
            <>
              <div className="border-t border-gray-200" />
              <button
                onClick={() => {
                  onAddCompany();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-primary-600 hover:bg-primary-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
