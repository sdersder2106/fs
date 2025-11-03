'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Save } from 'lucide-react';
import { Button, Input, Textarea, Select, Checkbox } from '@/components/ui';
import { PageHeader } from '@/components';

export default function NewTemplatePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'FINDING',
    category: 'Injection',
    content: '',
    isPublic: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard/templates/${data.data.id}`);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          alert(data.error || 'Failed to create template');
        }
      }
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template');
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

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Access denied. ADMIN only.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Create Template"
        description="Create a reusable template for findings or reports"
        backHref="/dashboard/templates"
      />

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="e.g., SQL Injection Template"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
            placeholder="Describe this template..."
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
                { value: 'FINDING', label: 'Finding' },
                { value: 'REPORT', label: 'Report' },
              ]}
            />

            <Input
              label="Category"
              required
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              error={errors.category}
              placeholder="e.g., Injection, XSS, etc."
            />
          </div>

          <Textarea
            label="Content"
            required
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            error={errors.content}
            placeholder="Template content with placeholders: {{title}}, {{severity}}, etc."
            rows={12}
          />

          <Checkbox
            label="Public Template"
            checked={formData.isPublic}
            onChange={(e) => handleChange('isPublic', e.target.checked)}
            description="Make this template available to all companies"
          />

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit" variant="primary" disabled={loading} className="gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/templates')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
