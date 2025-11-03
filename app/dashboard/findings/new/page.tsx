'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bug,
  AlertCircle,
  AlertTriangle,
  Info,
  Shield,
  Target,
  FileText,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Save,
  X,
  Upload,
  Plus,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SEVERITY_LEVELS = [
  { value: 'CRITICAL', label: 'Critical', icon: AlertCircle, color: 'text-red-600 bg-red-100' },
  { value: 'HIGH', label: 'High', icon: AlertTriangle, color: 'text-orange-600 bg-orange-100' },
  { value: 'MEDIUM', label: 'Medium', icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-100' },
  { value: 'LOW', label: 'Low', icon: Info, color: 'text-blue-600 bg-blue-100' },
  { value: 'INFO', label: 'Informational', icon: Info, color: 'text-gray-600 bg-gray-100' },
];

const FINDING_STATUS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const FINDING_CATEGORIES = [
  'SQL Injection',
  'Cross-Site Scripting (XSS)',
  'Authentication Bypass',
  'Authorization Flaws',
  'Information Disclosure',
  'Configuration Issues',
  'Cryptographic Weaknesses',
  'Business Logic Errors',
  'Race Conditions',
  'Denial of Service',
  'File Upload Vulnerabilities',
  'API Security Issues',
  'Other',
];

export default function NewFindingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pentests, setPentests] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedPentest, setSelectedPentest] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [references, setReferences] = useState<string[]>(['']);
  const [evidenceImages, setEvidenceImages] = useState<string[]>(['']);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    cvssScore: 5.0,
    status: 'OPEN',
    category: '',
    pentestId: '',
    targetId: '',
    proofOfConcept: '',
    reproductionSteps: '',
    requestExample: '',
    responseExample: '',
    remediation: '',
    remediationCode: '',
  });

  useEffect(() => {
    fetchPentests();
    fetchTargets();
  }, []);

  useEffect(() => {
    if (formData.pentestId && pentests.length > 0) {
      const pentest = pentests.find(p => p.id === formData.pentestId);
      setSelectedPentest(pentest);
      if (pentest) {
        setFormData(prev => ({ ...prev, targetId: pentest.target.id }));
      }
    }
  }, [formData.pentestId, pentests]);

  const fetchPentests = async () => {
    try {
      const response = await fetch('/api/pentests?status=IN_PROGRESS');
      const data = await response.json();
      if (data.success) {
        setPentests(data.data.items);
      }
    } catch (error) {
      console.error('Error fetching pentests:', error);
    }
  };

  const fetchTargets = async () => {
    try {
      const response = await fetch('/api/targets?status=ACTIVE');
      const data = await response.json();
      if (data.success) {
        setTargets(data.data.items);
      }
    } catch (error) {
      console.error('Error fetching targets:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.pentestId) {
      newErrors.pentestId = 'Please select a pentest';
    }
    if (!formData.targetId) {
      newErrors.targetId = 'Please select a target';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (formData.cvssScore < 0 || formData.cvssScore > 10) {
      newErrors.cvssScore = 'CVSS score must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/findings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          references: references.filter(r => r.trim()),
          evidenceImages: evidenceImages.filter(e => e.trim()),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard/findings');
      } else {
        setErrors({ submit: data.error || 'Failed to create finding' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred while creating the finding' });
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

  const addReference = () => {
    setReferences(prev => [...prev, '']);
  };

  const updateReference = (index: number, value: string) => {
    setReferences(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeReference = (index: number) => {
    setReferences(prev => prev.filter((_, i) => i !== index));
  };

  const addEvidenceImage = () => {
    setEvidenceImages(prev => [...prev, '']);
  };

  const updateEvidenceImage = (index: number, value: string) => {
    setEvidenceImages(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeEvidenceImage = (index: number) => {
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const getSeverityIcon = (severity: string) => {
    const level = SEVERITY_LEVELS.find(l => l.value === severity);
    return level ? level.icon : Info;
  };

  const getSeverityColor = (severity: string) => {
    const level = SEVERITY_LEVELS.find(l => l.value === severity);
    return level ? level.color : 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report New Finding</h1>
            <p className="text-sm text-gray-500 mt-1">
              Document a security vulnerability or issue
            </p>
          </div>
          <Link
            href="/dashboard/findings"
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
              <Bug className="h-5 w-5 mr-2 text-indigo-600" />
              Finding Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., SQL Injection in User Login Form"
                className={cn(
                  "mt-1 block w-full rounded-md shadow-sm",
                  errors.title
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide a detailed description of the vulnerability..."
                className={cn(
                  "mt-1 block w-full rounded-md shadow-sm",
                  errors.description
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pentestId" className="block text-sm font-medium text-gray-700">
                  Pentest <span className="text-red-500">*</span>
                </label>
                <select
                  id="pentestId"
                  name="pentestId"
                  value={formData.pentestId}
                  onChange={handleChange}
                  className={cn(
                    "mt-1 block w-full rounded-md shadow-sm",
                    errors.pentestId
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  )}
                >
                  <option value="">Select a pentest...</option>
                  {pentests.map((pentest) => (
                    <option key={pentest.id} value={pentest.id}>
                      {pentest.title}
                    </option>
                  ))}
                </select>
                {errors.pentestId && (
                  <p className="mt-1 text-sm text-red-600">{errors.pentestId}</p>
                )}
              </div>

              <div>
                <label htmlFor="targetId" className="block text-sm font-medium text-gray-700">
                  Target <span className="text-red-500">*</span>
                </label>
                <select
                  id="targetId"
                  name="targetId"
                  value={formData.targetId}
                  onChange={handleChange}
                  disabled={!selectedPentest}
                  className={cn(
                    "mt-1 block w-full rounded-md shadow-sm",
                    errors.targetId
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                    !selectedPentest && "bg-gray-100"
                  )}
                >
                  {selectedPentest ? (
                    <option value={selectedPentest.target.id}>
                      {selectedPentest.target.name} ({selectedPentest.target.type})
                    </option>
                  ) : (
                    <option value="">Select a pentest first...</option>
                  )}
                </select>
                {errors.targetId && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={cn(
                    "mt-1 block w-full rounded-md shadow-sm",
                    errors.category
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  )}
                >
                  <option value="">Select category...</option>
                  {FINDING_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {SEVERITY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cvssScore" className="block text-sm font-medium text-gray-700">
                  CVSS Score (0-10)
                </label>
                <input
                  type="number"
                  id="cvssScore"
                  name="cvssScore"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.cvssScore}
                  onChange={handleChange}
                  className={cn(
                    "mt-1 block w-full rounded-md shadow-sm",
                    errors.cvssScore
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  )}
                />
                {errors.cvssScore && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvssScore}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Proof of Concept */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Code className="h-5 w-5 mr-2 text-indigo-600" />
              Proof of Concept & Evidence
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="proofOfConcept" className="block text-sm font-medium text-gray-700">
                Proof of Concept
              </label>
              <textarea
                id="proofOfConcept"
                name="proofOfConcept"
                value={formData.proofOfConcept}
                onChange={handleChange}
                rows={4}
                placeholder="Provide proof of concept code or demonstration..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>

            <div>
              <label htmlFor="reproductionSteps" className="block text-sm font-medium text-gray-700">
                Reproduction Steps
              </label>
              <textarea
                id="reproductionSteps"
                name="reproductionSteps"
                value={formData.reproductionSteps}
                onChange={handleChange}
                rows={4}
                placeholder="1. Navigate to login page&#10;2. Enter payload in username field&#10;3. Submit form&#10;4. Observe error message..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="requestExample" className="block text-sm font-medium text-gray-700">
                  Request Example
                </label>
                <textarea
                  id="requestExample"
                  name="requestExample"
                  value={formData.requestExample}
                  onChange={handleChange}
                  rows={6}
                  placeholder="POST /login HTTP/1.1&#10;Host: example.com&#10;Content-Type: application/json&#10;&#10;{&quot;username&quot;: &quot;admin' OR '1'='1&quot;}"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label htmlFor="responseExample" className="block text-sm font-medium text-gray-700">
                  Response Example
                </label>
                <textarea
                  id="responseExample"
                  name="responseExample"
                  value={formData.responseExample}
                  onChange={handleChange}
                  rows={6}
                  placeholder="HTTP/1.1 200 OK&#10;Content-Type: application/json&#10;&#10;{&quot;error&quot;: &quot;SQL syntax error near...&quot;}"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Images
              </label>
              <div className="space-y-2">
                {evidenceImages.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => updateEvidenceImage(index, e.target.value)}
                      placeholder="https://example.com/screenshot.png"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeEvidenceImage(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEvidenceImage}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Image URL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Remediation */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-600" />
              Remediation
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="remediation" className="block text-sm font-medium text-gray-700">
                Remediation Recommendation
              </label>
              <textarea
                id="remediation"
                name="remediation"
                value={formData.remediation}
                onChange={handleChange}
                rows={4}
                placeholder="Describe how to fix this vulnerability..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="remediationCode" className="block text-sm font-medium text-gray-700">
                Remediation Code Example
              </label>
              <textarea
                id="remediationCode"
                name="remediationCode"
                value={formData.remediationCode}
                onChange={handleChange}
                rows={6}
                placeholder="// Use parameterized queries&#10;const query = 'SELECT * FROM users WHERE username = ?';&#10;db.execute(query, [username]);"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                References
              </label>
              <div className="space-y-2">
                {references.map((ref, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={ref}
                      onChange={(e) => updateReference(index, e.target.value)}
                      placeholder="https://owasp.org/..."
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeReference(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReference}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Reference
                </button>
              </div>
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
            href="/dashboard/findings"
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
            {loading ? 'Creating...' : 'Report Finding'}
          </button>
        </div>
      </form>
    </div>
  );
}
