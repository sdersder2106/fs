'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Globe,
  Server,
  Calendar,
  Target as TargetIcon,
  FileText,
  Bug,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { toast } from 'sonner';
import { formatDate, getCriticalityColor, getStatusColor } from '@/lib/utils';
import { AdminOnly, AuditorOnly } from '@/components/auth/role-guard';

export default function TargetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [target, setTarget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTarget();
  }, [params.id]);

  const fetchTarget = async () => {
    try {
      const response = await fetch(`/api/targets/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTarget(data);
      } else {
        toast.error('Target not found');
        router.push('/targets');
      }
    } catch (error) {
      console.error('Fetch target error:', error);
      toast.error('Failed to fetch target');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this target?')) return;

    try {
      const response = await fetch(`/api/targets/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Target deleted successfully');
        router.push('/targets');
      } else {
        toast.error('Failed to delete target');
      }
    } catch (error) {
      console.error('Delete target error:', error);
      toast.error('Failed to delete target');
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!target) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/targets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{target.name}</h1>
              <Badge className={getCriticalityColor(target.criticalityLevel)}>
                {target.criticalityLevel}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {target.targetType.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <AuditorOnly>
            <Link href={`/targets/${target.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </AuditorOnly>
          <AdminOnly>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AdminOnly>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pentests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{target._count.pentests}</div>
            <p className="text-xs text-muted-foreground">
              Total security assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Findings</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{target._count.findings}</div>
            <p className="text-xs text-muted-foreground">
              Discovered vulnerabilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {target.lastAssessment ? formatDate(target.lastAssessment) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {target.nextAssessment && `Next: ${formatDate(target.nextAssessment)}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Target Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {target.description && (
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{target.description}</p>
              </div>
            )}

            {target.url && (
              <div>
                <p className="text-sm font-medium mb-1">URL</p>
                <a
                  href={target.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  {target.url}
                </a>
              </div>
            )}

            {target.ipAddress && (
              <div>
                <p className="text-sm font-medium mb-1">IP Address</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  {target.ipAddress}
                </p>
              </div>
            )}

            {target.owner && (
              <div>
                <p className="text-sm font-medium mb-1">Owner / Responsible Team</p>
                <p className="text-sm text-muted-foreground">{target.owner}</p>
              </div>
            )}

            {target.technologyStack.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Technology Stack</p>
                <div className="flex flex-wrap gap-2">
                  {target.technologyStack.map((tech: string) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Criticality Level</p>
              <Badge className={getCriticalityColor(target.criticalityLevel)}>
                {target.criticalityLevel}
              </Badge>
            </div>

            {target.businessImpact && (
              <div>
                <p className="text-sm font-medium mb-1">Business Impact</p>
                <p className="text-sm text-muted-foreground">{target.businessImpact}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-1">Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(target.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(target.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Pentests */}
      {target.pentests && target.pentests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Pentests</CardTitle>
            <CardDescription>Security assessments for this target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {target.pentests.map((pentest: any) => (
                <Link
                  key={pentest.id}
                  href={`/pentests/${pentest.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{pentest.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(pentest.status)}>
                        {pentest.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(pentest.startDate)} - {formatDate(pentest.endDate)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Findings */}
      {target.findings && target.findings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Findings</CardTitle>
            <CardDescription>Vulnerabilities discovered in this target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {target.findings.map((finding: any) => (
                <Link
                  key={finding.id}
                  href={`/findings/${finding.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(finding.severity)}>
                        {finding.severity}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(finding.status)}>
                        {finding.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="font-medium">{finding.title}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(finding.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
