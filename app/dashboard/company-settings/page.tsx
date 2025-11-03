'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Save, Lock, Building } from 'lucide-react';
import { Button, Input, Textarea, Tabs, TabPanel } from '@/components/ui';
import { PageHeader } from '@/components';

interface Company {
  id: string;
  name: string;
  domain: string | null;
  logo: string | null;
  description: string | null;
  settings: any;
}

export default function CompanySettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [company, setCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
  });

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    if (isAdmin && session?.user?.companyId) {
      fetchCompany();
    }
  }, [session]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/companies/${session?.user?.companyId}`);
      const data = await res.json();

      if (data.success) {
        setCompany(data.data);
        setFormData({
          name: data.data.name,
          domain: data.data.domain || '',
          description: data.data.description || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      const res = await fetch(`/api/companies/${session?.user?.companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert('Company settings updated successfully!');
        fetchCompany();
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          alert(data.error || 'Failed to update company settings');
        }
      }
    } catch (error) {
      console.error('Failed to update company settings:', error);
      alert('Failed to update company settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">Only administrators can access company settings.</p>
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
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Company Settings"
        description="Manage your company information and settings (ADMIN)"
      />

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <TabPanel id="general" label="General">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                {company?.logo ? (
                  <img src={company.logo} alt={company.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <Building className="w-10 h-10 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{company?.name}</h3>
                <p className="text-sm text-gray-600">Company ID: {company?.id}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Company Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />

              <Input
                label="Domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                error={errors.domain}
                placeholder="example.com"
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={errors.description}
                rows={4}
              />

              <div className="pt-4 border-t">
                <Button type="submit" variant="primary" disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </TabPanel>

        <TabPanel id="users" label="Users">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
            <p className="text-gray-600">
              User management features coming soon. You can invite users via the user creation form.
            </p>
          </div>
        </TabPanel>

        <TabPanel id="compliance" label="Compliance">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Settings</h3>
            <p className="text-gray-600">
              Configure compliance frameworks and requirements (Coming soon)
            </p>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
