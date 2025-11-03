'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui';
import { PageHeader, LoadingSkeleton } from '@/components';
import Badge from '@/components/ui/Badge';

interface Template {
  id: string;
  name: string;
  description: string | null;
  type: string;
  category: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
  } | null;
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

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
        setTemplate(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/templates/${params.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/dashboard/templates');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleCopy = () => {
    if (template) {
      navigator.clipboard.writeText(template.content);
      alert('Template content copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton type="form" count={3} />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Template not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={template.name}
        description={template.description || 'No description'}
        backHref="/dashboard/templates"
        action={
          isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push(`/dashboard/templates/${template.id}/edit`)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="danger" onClick={handleDelete} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          )
        }
      />

      {/* Template Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-3">
            <Badge variant="blue">{template.type}</Badge>
            <Badge variant="gray">{template.category}</Badge>
            <Badge variant={template.isPublic ? 'green' : 'gray'}>
              {template.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Company</p>
            <p className="font-medium text-gray-900">
              {template.company ? template.company.name : 'Global Template'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Last Updated</p>
            <p className="font-medium text-gray-900">
              {new Date(template.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Template Content</h3>
            <Button variant="secondary" onClick={handleCopy} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200">
            {template.content}
          </pre>
        </div>

        {/* Placeholders Help */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Available Placeholders:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
            <code className="bg-gray-100 px-2 py-1 rounded">{'{{title}}'}</code>
            <code className="bg-gray-100 px-2 py-1 rounded">{'{{description}}'}</code>
            <code className="bg-gray-100 px-2 py-1 rounded">{'{{severity}}'}</code>
            <code className="bg-gray-100 px-2 py-1 rounded">{'{{cvssScore}}'}</code>
            <code className="bg-gray-100 px-2 py-1 rounded">{'{{category}}'}</code>
            <code className="bg-gray-100 px-2 py-1 rounded">{'{{target}}'}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
