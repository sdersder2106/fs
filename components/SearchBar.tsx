'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'date' | 'range';
  options?: { value: string; label: string }[];
}

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  filters?: FilterOption[];
  activeFilters?: Record<string, any>;
  onFilterChange?: (filterId: string, value: any) => void;
  onClearFilters?: () => void;
  sortOptions?: { value: string; label: string }[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  showAdvanced?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  sortOptions,
  sortValue,
  onSortChange,
  showAdvanced = false,
  className,
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const [showFilters, setShowFilters] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(localValue);
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    key => activeFilters[key] !== undefined && activeFilters[key] !== ''
  ).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main search bar */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              value={localValue}
              onChange={handleChange}
              placeholder={placeholder}
              className="pl-10 pr-3"
            />
          </div>
          
          {filters.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              icon={showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            >
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="danger" size="sm" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
          
          {showAdvanced && (
            <Button
              type="button"
              variant="ghost"
              icon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Advanced
            </Button>
          )}
          
          {sortOptions && (
            <Select
              options={sortOptions}
              value={sortValue}
              onChange={(e) => onSortChange?.(e.target.value)}
              placeholder="Sort by"
              className="w-40"
            />
          )}
        </div>
      </form>

      {/* Filter panel */}
      {showFilters && filters.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            {activeFilterCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearFilters}
                icon={<X className="w-3 h-3" />}
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filters.map(filter => {
              if (filter.type === 'select' && filter.options) {
                return (
                  <Select
                    key={filter.id}
                    label={filter.label}
                    options={filter.options}
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                    placeholder={`All ${filter.label}`}
                  />
                );
              }
              
              if (filter.type === 'date') {
                return (
                  <Input
                    key={filter.id}
                    type="date"
                    label={filter.label}
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                  />
                );
              }
              
              return null;
            })}
          </div>
          
          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
              {Object.entries(activeFilters).map(([key, value]) => {
                if (!value) return null;
                const filter = filters.find(f => f.id === key);
                if (!filter) return null;
                
                const displayValue = filter.options?.find(o => o.value === value)?.label || value;
                
                return (
                  <Badge
                    key={key}
                    variant="default"
                    removable
                    onRemove={() => onFilterChange?.(key, '')}
                  >
                    {filter.label}: {displayValue}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
