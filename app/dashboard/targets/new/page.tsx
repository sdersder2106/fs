'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/components/ui';

export default function NewTargetPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'WEB_APP',
    url: '',
    ipAddress: '',
    status: 'PENDING',
    riskScore: 0,
    companyId: session?.user?.companyId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard/targets/${data.data.id}`);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          alert(data.error || 'Failed to create target');
        }
      }
    } catch (error) {
      console.error('Failed to create target:', error);
      alert('Failed to create target');
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/targets">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Target</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="e.g., example.com"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
            placeholder="Describe this target..."
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
            placeholder="https://example.com"
          />

          <Input
            label="IP Address"
            value={formData.ipAddress}
            onChange={(e) => handleChange('ipAddress', e.target.value)}
            error={errors.ipAddress}
            placeholder="192.168.1.1"
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
            <Button type="submit" variant="primary" disabled={loading} className="gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Target'}
            </Button>
            <Link href="/dashboard/targets">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
