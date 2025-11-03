'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target,
  Globe,
  Server,
  Smartphone,
  Cloud,
  Database,
  Activity,
  Shield,
  Save,
  X,
  AlertCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const TARGET_TYPES = [
  { value: 'WEB_APP', label: 'Web Application', icon: Globe },
  { value: 'API', label: 'API', icon: Server },
  { value: 'MOBILE_APP', label: 'Mobile Application', icon: Smartphone },
  { value: 'NETWORK', label: 'Network', icon: Activity },
  { value: 'CLOUD', label: 'Cloud Infrastructure', icon: Cloud },
  { value: 'DATABASE', label: 'Database', icon: Database },
  { value: 'HOST', label: 'Host/Server', icon: Server },
  { value: 'OTHER', label: 'Other', icon: Shield },
];

const TARGET_STATUS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function NewTargetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    type: 'WEB_APP',
    url: '',
    ipAddress: '',
    description: '',
    status: 'ACTIVE',
    riskScore: 50,
    scope: {
      included: [] as string[],
      excluded: [] as string[],
    },
    credentials: {
      username: '',
      password: '',
      notes: '',
    },
    technicalContact: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const [scopeInput, setScopeInput] = useState({ included: '', excluded: '' });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Target name is required';
    }

    if (formData.type === 'WEB_APP' || formData.type === 'API') {
      if (!formData.url && !formData.ipAddress) {
        newErrors.url = 'URL or IP address is required for web applications and APIs';
      }
      if (formData.url && !isValidUrl(formData.url)) {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    if (formData.ipAddress && !isValidIp(formData.ipAddress)) {
      newErrors.ipAddress = 'Please enter a valid IP address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidIp = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scope: JSON.stringify(formData.scope),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard/targets');
      } else {
        setErrors({ submit: data.error || 'Failed to create target' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred while creating the target' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNestedChange = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const addScopeItem = (type: 'included' | 'excluded') => {
    const value = scopeInput[type].trim();
    if (value) {
      setFormData(prev => ({
        ...prev,
        scope: {
          ...prev.scope,
          [type]: [...prev.scope[type], value],
        },
      }));
      setScopeInput(prev => ({ ...prev, [type]: '' }));
    }
  };

  const removeScopeItem = (type: 'included' | 'excluded', index: number) => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        [type]: prev.scope[type].filter((_, i) => i !== index),
      },
    }));
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Minimal';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Target</h1>
            <p className="text-sm text-gray-500 mt-1">
              Define a new target for security assessment
            </p>
          </div>
          <Link
            href="/dashboard/targets"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-indigo-600" />
              Basic Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Target Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Production Web App"
                className={cn(
                  "mt-1 block w-full rounded-md shadow-sm",
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                )}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Target Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TARGET_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={cn(
                        "flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors",
                        formData.type === type.value
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Icon className={cn(
                        "h-6 w-6 mb-1",
                        formData.type === type.value ? "text-indigo-600" : "text-gray-400"
                      )} />
                      <span className={cn(
                        "text-xs text-center",
                        formData.type === type.value ? "text-indigo-900 font-medium" : "text-gray-600"
                      )}>
                        {type.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={cn(
                    "mt-1 block w-full rounded-md shadow-sm",
                    errors.url
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  )}
                />
                {errors.url && (
                  <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                )}
              </div>

              <div>
                <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700">
                  IP Address
                </label>
                <input
                  type="text"
                  id="ipAddress"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  placeholder="192.168.1.1"
                  className={cn(
                    "mt-1 block w-full rounded-md shadow-sm",
                    errors.ipAddress
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  )}
                />
                {errors.ipAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.ipAddress}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Provide additional details about this target..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {TARGET_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="riskScore" className="block text-sm font-medium text-gray-700">
                  Initial Risk Score: {formData.riskScore} ({getRiskLabel(formData.riskScore)})
                </label>
                <input
                  type="range"
                  id="riskScore"
                  name="riskScore"
                  min="0"
                  max="100"
                  value={formData.riskScore}
                  onChange={handleChange}
                  className="mt-1 block w-full"
                />
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all", getRiskColor(formData.riskScore))}
                    style={{ width: `${formData.riskScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scope */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-600" />
              Scope Definition
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                In Scope
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={scopeInput.included}
                  onChange={(e) => setScopeInput(prev => ({ ...prev, included: e.target.value }))}
                  placeholder="e.g., *.example.com"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addScopeItem('included');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addScopeItem('included')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.scope.included.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeScopeItem('included', index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Out of Scope
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={scopeInput.excluded}
                  onChange={(e) => setScopeInput(prev => ({ ...prev, excluded: e.target.value }))}
                  placeholder="e.g., admin.example.com"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addScopeItem('excluded');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addScopeItem('excluded')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.scope.excluded.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeScopeItem('excluded', index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Contact */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Technical Contact (Optional)</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="contactName"
                  value={formData.technicalContact.name}
                  onChange={(e) => handleNestedChange('technicalContact', 'name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={formData.technicalContact.email}
                  onChange={(e) => handleNestedChange('technicalContact', 'email', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  value={formData.technicalContact.phone}
                  onChange={(e) => handleNestedChange('technicalContact', 'phone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Security Notice
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Sensitive information like credentials should be stored securely. 
                Consider using a secure password manager or vault for production environments.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Link
            href="/dashboard/targets"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Target'}
          </button>
        </div>
      </form>
    </div>
  );
}
