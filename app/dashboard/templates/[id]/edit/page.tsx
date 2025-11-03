'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Save } from 'lucide-react';
import { Button, Input, Textarea, Select, Checkbox } from '@/components/ui';
import { PageHeader } from '@/components';

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'FINDING',
    category: '',
    content: '',
    isPublic: true,
  });

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchTemplate();
  }, [params.id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/templates/${params.id}`);
      const data = await res.json();

      if (data.success) {
        const template = data.data;
        setFormData({
          name: template.name,
          description: template.description || '',
          type: template.type,
          category: template.category,
          content: template.content,
          isPublic: template.isPublic,
        });
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      const res = await fetch(`/api/templates/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard/templates/${params.id}`);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          alert(data.error || 'Failed to update template');
        }
      }
    } catch (error) {
      console.error('Failed to update template:', error);
      alert('Failed to update template');
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

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Access denied. ADMIN only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Edit Template"
        backHref={`/dashboard/templates/${params.id}`}
      />

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
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
            />
          </div>

          <Textarea
            label="Content"
            required
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            error={errors.content}
            rows={12}
          />

          <Checkbox
            label="Public Template"
            checked={formData.isPublic}
            onChange={(e) => handleChange('isPublic', e.target.checked)}
            description="Make this template available to all companies"
          />

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit" variant="primary" disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/dashboard/templates/${params.id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
