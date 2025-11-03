'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Target as TargetIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import Badge from '@/components/ui/Badge';

interface Target {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  url: string | null;
  riskScore: number;
  company: {
    id: string;
    name: string;
  };
  _count: {
    pentests: number;
    findings: number;
  };
}

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/targets?${params}`);
      const data = await res.json();
      if (data.success) {
        setTargets(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch targets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'red';
    if (score >= 60) return 'orange';
    if (score >= 40) return 'yellow';
    return 'green';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Targets</h1>
          <p className="text-gray-600 mt-1">Manage your test targets</p>
        </div>
        <Link href="/dashboard/targets/new">
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            New Target
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search targets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTargets()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Targets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            </div>
          ))}
        </div>
      ) : targets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <TargetIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No targets found</p>
          <Link href="/dashboard/targets/new">
            <Button variant="primary">Create Your First Target</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {targets.map((target) => (
            <Link key={target.id} href={`/dashboard/targets/${target.id}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {target.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {target.description || 'No description'}
                    </p>
                  </div>
                  <Badge variant={target.status === 'ACTIVE' ? 'green' : 'gray'}>
                    {target.status}
                  </Badge>
                </div>

                <div className="mb-4">
                  <Badge variant="blue">{target.type.replace('_', ' ')}</Badge>
                </div>

                {target.url && (
                  <p className="text-sm text-blue-600 truncate mb-4">{target.url}</p>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Risk Score</span>
                    <span className="font-medium text-gray-900">{target.riskScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        target.riskScore >= 80 ? 'bg-red-600' :
                        target.riskScore >= 60 ? 'bg-orange-500' :
                        target.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${target.riskScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{target._count.pentests}</span>
                    <span className="text-gray-500"> pentests</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{target._count.findings}</span>
                    <span className="text-gray-500"> findings</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
