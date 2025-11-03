'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function EditFindingPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  });

  useEffect(() => {
    fetchPentests();
    fetchTargets();
    fetchFinding();
  }, [params.id]);

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

  const fetchFinding = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/findings/${params.id}`);
      const data = await res.json();
      
      if (data.success) {
        const finding = data.data;
        setFormData({
          title: finding.title,
          description: finding.description,
          severity: finding.severity,
          cvssScore: finding.cvssScore,
          status: finding.status,
          category: finding.category || '',
          proofOfConcept: finding.proofOfConcept || '',
          reproductionSteps: finding.reproductionSteps || '',
          remediation: finding.remediation || '',
          pentestId: finding.pentest.id,
          targetId: finding.target.id,
        });
      }
    } catch (error) {
      console.error('Failed to fetch finding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      const res = await fetch(`/api/findings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard/findings/${params.id}`);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          alert(data.error || 'Failed to update finding');
        }
      }
    } catch (error) {
      console.error('Failed to update finding:', error);
      alert('Failed to update finding');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/findings/${params.id}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Finding</h1>

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
            />

            <Textarea
              label="Description"
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={errors.description}
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Status"
                required
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                error={errors.status}
                options={[
                  { value: 'OPEN', label: 'Open' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'RESOLVED', label: 'Resolved' },
                  { value: 'CLOSED', label: 'Closed' },
                  { value: 'FALSE_POSITIVE', label: 'False Positive' },
                ]}
              />

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
              rows={6}
            />

            <Textarea
              label="Reproduction Steps"
              value={formData.reproductionSteps}
              onChange={(e) => handleChange('reproductionSteps', e.target.value)}
              error={errors.reproductionSteps}
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
              rows={6}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button type="submit" variant="primary" disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href={`/dashboard/findings/${params.id}`}>
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
