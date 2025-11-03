'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui';
import { PageHeader, SearchBar, EmptyState, LoadingSkeleton } from '@/components';
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
  company: {
    id: string;
    name: string;
  } | null;
}

export default function TemplatesPage() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Check if user is ADMIN
  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/templates?${params}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">Only administrators can access templates management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Manage finding and report templates (ADMIN)"
        action={
          <Link href="/dashboard/templates/new">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </Link>
        }
      />

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <SearchBar
          placeholder="Search templates..."
          onSearch={(query) => {
            setSearch(query);
            fetchTemplates();
          }}
        />
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12 text-gray-400" />}
          title="No templates found"
          description="Create reusable templates for findings and reports"
          actionLabel="Create Template"
          actionHref="/dashboard/templates/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Link key={template.id} href={`/dashboard/templates/${template.id}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {template.description || 'No description'}
                    </p>
                  </div>
                  {template.isPublic ? (
                    <Badge variant="green">Public</Badge>
                  ) : (
                    <Badge variant="gray">Private</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="blue">{template.type}</Badge>
                  <Badge variant="gray">{template.category}</Badge>
                </div>

                <div className="text-sm text-gray-600">
                  {template.company ? (
                    <p>Company: {template.company.name}</p>
                  ) : (
                    <p>Global template</p>
                  )}
                  <p className="mt-1">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
