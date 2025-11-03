'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/components/ui';

export default function EditTargetPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'WEB_APP',
    url: '',
    ipAddress: '',
    status: 'PENDING',
    riskScore: 0,
  });

  useEffect(() => {
    fetchTarget();
  }, [params.id]);

  const fetchTarget = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/targets/${params.id}`);
      const data = await res.json();
      
      if (data.success) {
        const target = data.data;
        setFormData({
          name: target.name,
          description: target.description || '',
          type: target.type,
          url: target.url || '',
          ipAddress: target.ipAddress || '',
          status: target.status,
          riskScore: target.riskScore,
        });
      }
    } catch (error) {
      console.error('Failed to fetch target:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      const res = await fetch(`/api/targets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard/targets/${params.id}`);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          alert(data.error || 'Failed to update target');
        }
      }
    } catch (error) {
      console.error('Failed to update target:', error);
      alert('Failed to update target');
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
      <div className="max-w-3xl mx-auto space-y-6">
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/targets/${params.id}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Target</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Type"
              required
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              error={errors.type}
              options={[
                { value: 'WEB_APP', label: 'Web Application' },
                { value: 'API', label: 'API' },
                { value: 'CLOUD', label: 'Cloud Service' },
                { value: 'HOST', label: 'Host/Server' },
              ]}
            />

            <Select
              label="Status"
              required
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              error={errors.status}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>

          <Input
            label="URL"
            type="url"
            value={formData.url}
            onChange={(e) => handleChange('url', e.target.value)}
            error={errors.url}
          />

          <Input
            label="IP Address"
            value={formData.ipAddress}
            onChange={(e) => handleChange('ipAddress', e.target.value)}
            error={errors.ipAddress}
          />

          <Input
            label="Risk Score (0-100)"
            type="number"
            min="0"
            max="100"
            value={formData.riskScore}
            onChange={(e) => handleChange('riskScore', parseInt(e.target.value) || 0)}
            error={errors.riskScore}
          />

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit" variant="primary" disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href={`/dashboard/targets/${params.id}`}>
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
