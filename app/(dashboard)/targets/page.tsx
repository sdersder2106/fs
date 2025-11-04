'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Target as TargetIcon,
  Plus,
  Search,
  Filter,
  Globe,
  Server,
  Smartphone,
  Cloud,
  Network,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingPage } from '@/components/ui/loading';
import { toast } from 'sonner';
import { formatDate, getCriticalityColor } from '@/lib/utils';
import { AdminOnly, AuditorOnly } from '@/components/auth/role-guard';

const TARGET_TYPES = {
  WEB_APPLICATION: { label: 'Web App', icon: Globe, color: 'text-blue-500' },
  API_ENDPOINT: { label: 'API', icon: Server, color: 'text-green-500' },
  MOBILE_APPLICATION: { label: 'Mobile', icon: Smartphone, color: 'text-purple-500' },
  NETWORK_INFRASTRUCTURE: { label: 'Network', icon: Network, color: 'text-orange-500' },
  CLOUD_RESOURCES: { label: 'Cloud', icon: Cloud, color: 'text-cyan-500' },
};

export default function TargetsPage() {
  const router = useRouter();
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [targetType, setTargetType] = useState('ALL');
  const [criticalityLevel, setCriticalityLevel] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTargets();
  }, [search, targetType, criticalityLevel, page]);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '12',
      });

      if (search) params.append('search', search);
      if (targetType !== 'ALL') params.append('targetType', targetType);
      if (criticalityLevel !== 'ALL') params.append('criticalityLevel', criticalityLevel);

      const response = await fetch(`/api/targets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTargets(data.data);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Failed to fetch targets');
      }
    } catch (error) {
      console.error('Fetch targets error:', error);
      toast.error('Failed to fetch targets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this target?')) return;

    try {
      const response = await fetch(`/api/targets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Target deleted successfully');
        fetchTargets();
      } else {
        toast.error('Failed to delete target');
      }
    } catch (error) {
      console.error('Delete target error:', error);
      toast.error('Failed to delete target');
    }
  };

  if (loading && targets.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Targets</h1>
          <p className="text-muted-foreground">
            Manage your security assessment targets
          </p>
        </div>
        <AuditorOnly>
          <Link href="/targets/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Target
            </Button>
          </Link>
        </AuditorOnly>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search targets..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={targetType}
              onValueChange={(value) => {
                setTargetType(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Target Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {Object.entries(TARGET_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={criticalityLevel}
              onValueChange={(value) => {
                setCriticalityLevel(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Targets Grid */}
      {targets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TargetIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No targets found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by adding your first target
            </p>
            <AuditorOnly>
              <Link href="/targets/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Add Target
                </Button>
              </Link>
            </AuditorOnly>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {targets.map((target) => {
              const TypeIcon = TARGET_TYPES[target.targetType as keyof typeof TARGET_TYPES]?.icon || TargetIcon;
              const typeColor = TARGET_TYPES[target.targetType as keyof typeof TARGET_TYPES]?.color || '';

              return (
                <Card key={target.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`h-5 w-5 ${typeColor}`} />
                        <Badge className={getCriticalityColor(target.criticalityLevel)}>
                          {target.criticalityLevel}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Link href={`/targets/${target.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AuditorOnly>
                          <Link href={`/targets/${target.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </AuditorOnly>
                        <AdminOnly>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(target.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AdminOnly>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{target.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {target.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {target.url && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{target.url}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{target._count.pentests} Pentests</span>
                        <span>{target._count.findings} Findings</span>
                      </div>
                      {target.lastAssessment && (
                        <p className="text-xs text-muted-foreground">
                          Last assessed: {formatDate(target.lastAssessment)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
