'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Target as TargetIcon } from 'lucide-react';
import { Button, Tabs, TabPanel } from '@/components/ui';
import Badge from '@/components/ui/Badge';

interface Target {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  url: string | null;
  ipAddress: string | null;
  riskScore: number;
  scope: string[];
  company: {
    id: string;
    name: string;
  };
  pentests: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
    startDate: string;
    endDate: string;
  }>;
  findings: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    cvssScore: number;
    createdAt: string;
  }>;
  _count: {
    pentests: number;
    findings: number;
  };
}

export default function TargetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [target, setTarget] = useState<Target | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTarget();
  }, [params.id]);

  const fetchTarget = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/targets/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setTarget(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch target:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this target?')) return;

    try {
      const res = await fetch(`/api/targets/${params.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/dashboard/targets');
      }
    } catch (error) {
      console.error('Failed to delete target:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'red',
      HIGH: 'orange',
      MEDIUM: 'yellow',
      LOW: 'blue',
      INFO: 'gray',
    };
    return colors[severity] || 'gray';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!target) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Target not found</p>
        <Link href="/dashboard/targets">
          <Button variant="primary" className="mt-4">Back to Targets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/targets">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Target Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{target.name}</h1>
              <Badge variant={target.status === 'ACTIVE' ? 'green' : 'gray'}>
                {target.status}
              </Badge>
              <Badge variant="blue">{target.type.replace('_', ' ')}</Badge>
            </div>
            <p className="text-gray-600">{target.description || 'No description'}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/targets/${target.id}/edit`}>
              <Button variant="secondary" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>
            <Button variant="danger" className="gap-2" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Risk Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Risk Score</span>
            <span className="font-semibold text-gray-900">{target.riskScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                target.riskScore >= 80 ? 'bg-red-600' :
                target.riskScore >= 60 ? 'bg-orange-500' :
                target.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${target.riskScore}%` }}
            ></div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Company</p>
            <p className="font-medium text-gray-900">{target.company.name}</p>
          </div>
          {target.url && (
            <div>
              <p className="text-sm text-gray-600 mb-1">URL</p>
              <a
                href={target.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline truncate block"
              >
                {target.url}
              </a>
            </div>
          )}
          {target.ipAddress && (
            <div>
              <p className="text-sm text-gray-600 mb-1">IP Address</p>
              <p className="font-medium text-gray-900">{target.ipAddress}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TargetIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{target._count.pentests}</p>
              <p className="text-sm text-gray-600">Pentests</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TargetIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{target._count.findings}</p>
              <p className="text-sm text-gray-600">Findings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <TabPanel id="overview" label="Overview">
          {target.scope.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scope</h3>
              <div className="flex flex-wrap gap-2">
                {target.scope.map((item, index) => (
                  <Badge key={index} variant="gray">{item}</Badge>
                ))}
              </div>
            </div>
          )}
        </TabPanel>

        <TabPanel id="pentests" label={`Pentests (${target._count.pentests})`}>
          <div className="bg-white border border-gray-200 rounded-xl divide-y">
            {target.pentests.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No pentests yet</div>
            ) : (
              target.pentests.map((pentest) => (
                <Link key={pentest.id} href={`/dashboard/pentests/${pentest.id}`}>
                  <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{pentest.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(pentest.startDate).toLocaleDateString()} - {new Date(pentest.endDate).toLocaleDateString()}
                        </p>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${pentest.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="blue">{pentest.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </TabPanel>

        <TabPanel id="findings" label={`Findings (${target._count.findings})`}>
          <div className="bg-white border border-gray-200 rounded-xl divide-y">
            {target.findings.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No findings yet</div>
            ) : (
              target.findings.map((finding) => (
                <Link key={finding.id} href={`/dashboard/findings/${finding.id}`}>
                  <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(finding.severity)}>
                            {finding.severity}
                          </Badge>
                          <span className="text-sm text-gray-600">CVSS {finding.cvssScore}</span>
                        </div>
                        <h4 className="font-medium text-gray-900">{finding.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(finding.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="blue">{finding.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
