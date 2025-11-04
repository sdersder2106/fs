import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: { value: string; label: string }[];
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  onApply: (filters: Record<string, string>) => void;
  activeFilters?: Record<string, string>;
}

export function AdvancedFilters({ filters, onApply, activeFilters = {} }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(activeFilters);

  const handleApply = () => {
    onApply(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({});
    onApply({});
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onApply(newFilters);
  };

  const activeCount = Object.keys(localFilters).filter(
    (key) => localFilters[key] && localFilters[key] !== 'ALL'
  ).length;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Advanced Filters</h4>
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear all
                </Button>
              )}
            </div>

            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label htmlFor={filter.key}>{filter.label}</Label>
                {filter.type === 'select' && filter.options && (
                  <Select
                    value={localFilters[filter.key] || 'ALL'}
                    onValueChange={(value) =>
                      setLocalFilters({ ...localFilters, [filter.key]: value })
                    }
                  >
                    <SelectTrigger id={filter.key}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {filter.type === 'text' && (
                  <Input
                    id={filter.key}
                    value={localFilters[filter.key] || ''}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, [filter.key]: e.target.value })
                    }
                    placeholder={`Filter by ${filter.label.toLowerCase()}`}
                  />
                )}
                {filter.type === 'date' && (
                  <Input
                    id={filter.key}
                    type="date"
                    value={localFilters[filter.key] || ''}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, [filter.key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleApply} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(localFilters)
            .filter(([_, value]) => value && value !== 'ALL')
            .map(([key, value]) => {
              const filter = filters.find((f) => f.key === key);
              const option = filter?.options?.find((o) => o.value === value);
              return (
                <Badge key={key} variant="secondary" className="gap-1">
                  {filter?.label}: {option?.label || value}
                  <button
                    onClick={() => handleRemoveFilter(key)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
        </div>
      )}
    </div>
  );
}
