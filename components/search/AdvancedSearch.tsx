'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Target,
  Shield,
  Bug,
  FileText,
  User,
  Building,
  AlertCircle,
  Clock,
  TrendingUp,
  Hash,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import debounce from 'lodash/debounce';

interface SearchFilters {
  query: string;
  type: string[];
  severity?: string[];
  status?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  assignedTo?: string;
  reporter?: string;
  company?: string;
  riskScore?: {
    min: number;
    max: number;
  };
  cvssScore?: {
    min: number;
    max: number;
  };
  tags?: string[];
}

interface SearchResult {
  id: string;
  type: 'pentest' | 'target' | 'finding' | 'report';
  title: string;
  description?: string;
  severity?: string;
  status?: string;
  score?: number;
  date?: string;
  url?: string;
  highlight?: string;
}

const ENTITY_TYPES = [
  { value: 'pentest', label: 'Pentests', icon: Shield, color: 'text-indigo-600' },
  { value: 'target', label: 'Targets', icon: Target, color: 'text-green-600' },
  { value: 'finding', label: 'Findings', icon: Bug, color: 'text-red-600' },
  { value: 'report', label: 'Reports', icon: FileText, color: 'text-purple-600' },
];

const SEVERITY_LEVELS = [
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'LOW', label: 'Low', color: 'bg-blue-100 text-blue-700' },
  { value: 'INFO', label: 'Info', color: 'bg-gray-100 text-gray-700' },
];

const STATUS_OPTIONS = {
  pentest: [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ],
  finding: [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ],
  target: [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ARCHIVED', label: 'Archived' },
  ],
};

const SAVED_SEARCHES = [
  { id: '1', name: 'Critical Open Findings', filters: { type: ['finding'], severity: ['CRITICAL'], status: ['OPEN'] } },
  { id: '2', name: 'Recent Pentests', filters: { type: ['pentest'], dateRange: { from: '30d', to: 'now' } } },
  { id: '3', name: 'High Risk Targets', filters: { type: ['target'], riskScore: { min: 70, max: 100 } } },
];

export default function AdvancedSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    type: searchParams.get('type')?.split(',') || [],
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState(SAVED_SEARCHES);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchFilters: SearchFilters) => {
      if (!searchFilters.query && searchFilters.type.length === 0) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        if (searchFilters.query) params.append('q', searchFilters.query);
        if (searchFilters.type.length > 0) params.append('type', searchFilters.type.join(','));
        if (searchFilters.severity?.length) params.append('severity', searchFilters.severity.join(','));
        if (searchFilters.status?.length) params.append('status', searchFilters.status.join(','));
        if (searchFilters.dateRange?.from) params.append('from', searchFilters.dateRange.from);
        if (searchFilters.dateRange?.to) params.append('to', searchFilters.dateRange.to);
        if (searchFilters.riskScore?.min) params.append('minRisk', searchFilters.riskScore.min.toString());
        if (searchFilters.riskScore?.max) params.append('maxRisk', searchFilters.riskScore.max.toString());
        if (searchFilters.cvssScore?.min) params.append('minCvss', searchFilters.cvssScore.min.toString());
        if (searchFilters.cvssScore?.max) params.append('maxCvss', searchFilters.cvssScore.max.toString());

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setResults(data.data.results);
          
          // Save to recent searches
          if (searchFilters.query) {
            setRecentSearches(prev => {
              const updated = [searchFilters.query, ...prev.filter(q => q !== searchFilters.query)];
              return updated.slice(0, 5);
            });
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(filters);
  }, [filters, performSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  const handleSeverityToggle = (severity: string) => {
    setFilters(prev => ({
      ...prev,
      severity: prev.severity?.includes(severity)
        ? prev.severity.filter(s => s !== severity)
        : [...(prev.severity || []), severity]
    }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...(prev.status || []), status]
    }));
  };

  const clearFilters = () => {
    setFilters({ query: '', type: [] });
    setResults([]);
  };

  const saveSearch = () => {
    if (!searchName) return;
    
    const newSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: { ...filters }
    };
    
    setSavedSearches(prev => [...prev, newSearch]);
    setSearchName('');
    setShowSaveDialog(false);
  };

  const loadSavedSearch = (search: typeof SAVED_SEARCHES[0]) => {
    setFilters(search.filters as SearchFilters);
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  const getResultIcon = (type: string) => {
    const entityType = ENTITY_TYPES.find(t => t.value === type);
    return entityType ? entityType.icon : FileText;
  };

  const getResultColor = (type: string) => {
    const entityType = ENTITY_TYPES.find(t => t.value === type);
    return entityType ? entityType.color : 'text-gray-600';
  };

  const navigateToResult = (result: SearchResult) => {
    setIsOpen(false);
    router.push(`/dashboard/${result.type}s/${result.id}`);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Search className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-600">Search...</span>
        <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="absolute inset-x-4 top-20 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl">
            <div className="h-full bg-white rounded-xl shadow-2xl flex flex-col">
              {/* Search Header */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    placeholder="Search pentests, targets, findings, reports..."
                    className="flex-1 text-lg outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Quick Filters */}
                <div className="flex items-center space-x-2 mt-3">
                  {ENTITY_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = filters.type.includes(type.value);
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleTypeToggle(type.value)}
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors",
                          isActive
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {type.label}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    Advanced
                    {showAdvanced ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </button>

                  {(filters.type.length > 0 || filters.severity?.length || filters.status?.length) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Advanced Filters */}
                {showAdvanced && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                    {/* Severity Filter */}
                    {filters.type.includes('finding') && (
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-2 block">Severity</label>
                        <div className="flex flex-wrap gap-2">
                          {SEVERITY_LEVELS.map((level) => (
                            <button
                              key={level.value}
                              onClick={() => handleSeverityToggle(level.value)}
                              className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                filters.severity?.includes(level.value)
                                  ? level.color
                                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                              )}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Filter */}
                    {filters.type.length === 1 && STATUS_OPTIONS[filters.type[0] as keyof typeof STATUS_OPTIONS] && (
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-2 block">Status</label>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS[filters.type[0] as keyof typeof STATUS_OPTIONS].map((status) => (
                            <button
                              key={status.value}
                              onClick={() => handleStatusToggle(status.value)}
                              className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                filters.status?.includes(status.value)
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                              )}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">From Date</label>
                        <input
                          type="date"
                          value={filters.dateRange?.from || ''}
                          onChange={(e) => handleFilterChange('dateRange', { 
                            ...filters.dateRange, 
                            from: e.target.value 
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">To Date</label>
                        <input
                          type="date"
                          value={filters.dateRange?.to || ''}
                          onChange={(e) => handleFilterChange('dateRange', { 
                            ...filters.dateRange, 
                            to: e.target.value 
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    {/* Risk/CVSS Score Range */}
                    <div className="grid grid-cols-2 gap-3">
                      {filters.type.includes('target') && (
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Risk Score ({filters.riskScore?.min || 0} - {filters.riskScore?.max || 100})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={filters.riskScore?.min || 0}
                            onChange={(e) => handleFilterChange('riskScore', {
                              ...filters.riskScore,
                              min: parseInt(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>
                      )}
                      
                      {filters.type.includes('finding') && (
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            CVSS Score ({filters.cvssScore?.min || 0} - {filters.cvssScore?.max || 10})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={filters.cvssScore?.min || 0}
                            onChange={(e) => handleFilterChange('cvssScore', {
                              ...filters.cvssScore,
                              min: parseFloat(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center space-x-2 text-gray-500">
                      <Clock className="h-5 w-5 animate-spin" />
                      <span>Searching...</span>
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="divide-y">
                    {results.map((result) => {
                      const Icon = getResultIcon(result.type);
                      const color = getResultColor(result.type);
                      
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => navigateToResult(result)}
                          className="w-full p-4 hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={cn("p-2 rounded-lg bg-gray-100", color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {result.title}
                                </h4>
                                {result.severity && (
                                  <span className={cn(
                                    "px-2 py-0.5 text-xs font-medium rounded",
                                    SEVERITY_LEVELS.find(s => s.value === result.severity)?.color
                                  )}>
                                    {result.severity}
                                  </span>
                                )}
                                {result.status && (
                                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                                    {result.status}
                                  </span>
                                )}
                              </div>
                              {result.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {result.description}
                                </p>
                              )}
                              {result.highlight && (
                                <p className="text-xs text-gray-600 mt-1"
                                  dangerouslySetInnerHTML={{ 
                                    __html: result.highlight 
                                  }}
                                />
                              )}
                            </div>
                            {result.score !== undefined && (
                              <div className="text-right">
                                <span className="text-sm font-medium text-gray-900">
                                  {result.score}
                                </span>
                                <span className="text-xs text-gray-500 block">
                                  Score
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : filters.query || filters.type.length > 0 ? (
                  <div className="p-8 text-center">
                    <Search className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-gray-500">No results found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Recent Searches
                        </h3>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleFilterChange('query', search)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                            >
                              <Clock className="inline h-3 w-3 mr-2 text-gray-400" />
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Saved Searches */}
                    {savedSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Saved Searches
                          </h3>
                          <button
                            onClick={() => setShowSaveDialog(true)}
                            className="text-xs text-indigo-600 hover:text-indigo-500"
                          >
                            Save current
                          </button>
                        </div>
                        <div className="space-y-1">
                          {savedSearches.map((search) => (
                            <div
                              key={search.id}
                              className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded group"
                            >
                              <button
                                onClick={() => loadSavedSearch(search)}
                                className="flex-1 text-left text-gray-700"
                              >
                                <Tag className="inline h-3 w-3 mr-2 text-gray-400" />
                                {search.name}
                              </button>
                              <button
                                onClick={() => deleteSavedSearch(search.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                              >
                                <X className="h-3 w-3 text-gray-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search Footer */}
              <div className="p-3 border-t bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <kbd className="px-1.5 py-0.5 font-semibold bg-white border border-gray-300 rounded">↵</kbd>
                      <span className="ml-1">to select</span>
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-1.5 py-0.5 font-semibold bg-white border border-gray-300 rounded">↑</kbd>
                      <kbd className="px-1.5 py-0.5 font-semibold bg-white border border-gray-300 rounded ml-0.5">↓</kbd>
                      <span className="ml-1">to navigate</span>
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-1.5 py-0.5 font-semibold bg-white border border-gray-300 rounded">esc</kbd>
                      <span className="ml-1">to close</span>
                    </span>
                  </div>
                  {results.length > 0 && (
                    <span>{results.length} results</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Search</h3>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter search name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSearchName('');
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={saveSearch}
                disabled={!searchName}
                className={cn(
                  "px-4 py-2 text-sm rounded-md",
                  searchName
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
