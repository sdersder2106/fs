'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/components/ui';

interface Pentest {
  id: string;
  title: string;
}

interface Target {
  id: string;
  name: string;
}

export default function NewFindingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [pentests, setPentests] = useState<Pentest[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    cvssScore: 5.0,
    status: 'OPEN',
    category: '',
    proofOfConcept: '',
    reproductionSteps: '',
    remediation: '',
    pentestId: '',
    targetId: '',
    companyId: session?.user?.companyId || '',
  });

  useEffect(() => {
    fetchPentests();
    fetchTargets();
  }, []);

  const fetchPentests = async () => {
    try {
      const res = await fetch('/api/pentests?limit=100');
      const data = await res.json();
      if (data.success) setPentests(data.data);
    } catch (error) {
      console.error('Failed to fetch pentests:', error);
    }
  };

  const fetchTargets = async () => {
    try {
      const res = await fetch('/api/targets?limit=100');
      const data = await res.json();
      if (data.success) setTargets(data.data);
    } catch (error) {
      console.error('Failed to fetch targets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard/findings/${data.data.id}`);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          alert(data.error || 'Failed to create finding');
        }
      }
    } catch (error) {
      console.error('Failed to create finding:', error);
      alert('Failed to create finding');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/findings">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Finding</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <Input
              label="Title"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={errors.title}
              placeholder="e.g., SQL Injection in Login Form"
            />

            <Textarea
              label="Description"
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={errors.description}
              placeholder="Describe the vulnerability in detail..."
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Severity"
                required
                value={formData.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                error={errors.severity}
                options={[
                  { value: 'CRITICAL', label: 'Critical' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'LOW', label: 'Low' },
                  { value: 'INFO', label: 'Info' },
                ]}
              />

              <Input
                label="CVSS Score"
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={formData.cvssScore}
                onChange={(e) => handleChange('cvssScore', parseFloat(e.target.value))}
                error={errors.cvssScore}
              />

              <Input
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                error={errors.category}
                placeholder="e.g., Injection"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Pentest"
                required
                value={formData.pentestId}
                onChange={(e) => handleChange('pentestId', e.target.value)}
                error={errors.pentestId}
                options={[
                  { value: '', label: 'Select a pentest' },
                  ...pentests.map((p) => ({ value: p.id, label: p.title })),
                ]}
              />

              <Select
                label="Target"
                required
                value={formData.targetId}
                onChange={(e) => handleChange('targetId', e.target.value)}
                error={errors.targetId}
                options={[
                  { value: '', label: 'Select a target' },
                  ...targets.map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
            </div>
          </div>

          {/* Evidence */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900">Evidence</h2>

            <Textarea
              label="Proof of Concept"
              value={formData.proofOfConcept}
              onChange={(e) => handleChange('proofOfConcept', e.target.value)}
              error={errors.proofOfConcept}
              placeholder="Paste your POC code or payload here..."
              rows={6}
            />

            <Textarea
              label="Reproduction Steps"
              value={formData.reproductionSteps}
              onChange={(e) => handleChange('reproductionSteps', e.target.value)}
              error={errors.reproductionSteps}
              placeholder="1. Navigate to...\n2. Enter payload...\n3. Observe..."
              rows={6}
            />
          </div>

          {/* Remediation */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900">Remediation</h2>

            <Textarea
              label="Remediation Guide"
              value={formData.remediation}
              onChange={(e) => handleChange('remediation', e.target.value)}
              error={errors.remediation}
              placeholder="Describe how to fix this vulnerability..."
              rows={6}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button type="submit" variant="primary" disabled={loading} className="gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Finding'}
            </Button>
            <Link href="/dashboard/findings">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
