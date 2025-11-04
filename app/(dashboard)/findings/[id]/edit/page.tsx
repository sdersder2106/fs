'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading';
import { toast } from 'sonner';

const findingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED', 'FALSE_POSITIVE']),
  reproductionSteps: z.string().optional(),
  proofOfConcept: z.string().optional(),
  businessImpact: z.string().optional(),
  technicalImpact: z.string().optional(),
  recommendedFix: z.string().optional(),
  cvssScore: z.number().min(0).max(10).optional(),
  cvssVector: z.string().optional(),
  owaspCategory: z.string().optional(),
});

type FindingFormData = z.infer<typeof findingSchema>;

export default function EditFindingPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finding, setFinding] = useState<any>(null);
  const [affectedAssets, setAffectedAssets] = useState<string[]>([]);
  const [assetInput, setAssetInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FindingFormData>({
    resolver: zodResolver(findingSchema),
  });

  const severity = watch('severity');

  useEffect(() => {
    fetchFinding();
  }, [params.id]);

  const fetchFinding = async () => {
    try {
      const response = await fetch(`/api/findings/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFinding(data);
        setAffectedAssets(data.affectedAssets || []);
        
        reset({
          title: data.title,
          description: data.description,
          severity: data.severity,
          status: data.status,
          reproductionSteps: data.reproductionSteps || '',
          proofOfConcept: data.proofOfConcept || '',
          businessImpact: data.businessImpact || '',
          technicalImpact: data.technicalImpact || '',
          recommendedFix: data.recommendedFix || '',
          cvssScore: data.cvssScore || undefined,
          cvssVector: data.cvssVector || '',
          owaspCategory: data.owaspCategory || '',
        });
      } else {
        toast.error('Finding not found');
        router.push('/findings');
      }
    } catch (error) {
      console.error('Fetch finding error:', error);
      toast.error('Failed to fetch finding');
    } finally {
      setLoading(false);
    }
  };

  const addAsset = () => {
    if (assetInput.trim() && !affectedAssets.includes(assetInput.trim())) {
      setAffectedAssets([...affectedAssets, assetInput.trim()]);
      setAssetInput('');
    }
  };

  const removeAsset = (asset: string) => {
    setAffectedAssets(affectedAssets.filter((a) => a !== asset));
  };

  const onSubmit = async (data: FindingFormData) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/findings/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          affectedAssets,
          cvssScore: data.cvssScore || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Finding updated successfully');
        router.push(`/findings/${params.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update finding');
      }
    } catch (error) {
      console.error('Update finding error:', error);
      toast.error('Failed to update finding');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!finding) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/findings/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Finding</h1>
          <p className="text-muted-foreground">Update vulnerability information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., SQL Injection in Login"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Detailed description..."
                rows={5}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="severity">
                  Severity <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={severity}
                  onValueChange={(value) => setValue('severity', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="INFORMATIONAL">Informational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted Risk</SelectItem>
                    <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reproductionSteps">Reproduction Steps</Label>
              <Textarea
                id="reproductionSteps"
                placeholder="Step-by-step..."
                rows={4}
                {...register('reproductionSteps')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proofOfConcept">Proof of Concept</Label>
              <Textarea
                id="proofOfConcept"
                placeholder="Code or payload..."
                rows={4}
                className="font-mono text-sm"
                {...register('proofOfConcept')}
              />
            </div>

            <div className="space-y-2">
              <Label>Affected Assets</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., /api/login"
                  value={assetInput}
                  onChange={(e) => setAssetInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAsset();
                    }
                  }}
                />
                <Button type="button" onClick={addAsset} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {affectedAssets.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {affectedAssets.map((asset) => (
                    <Badge key={asset} variant="secondary">
                      {asset}
                      <button
                        type="button"
                        onClick={() => removeAsset(asset)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact & Remediation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessImpact">Business Impact</Label>
              <Textarea
                id="businessImpact"
                placeholder="Business consequences..."
                rows={3}
                {...register('businessImpact')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalImpact">Technical Impact</Label>
              <Textarea
                id="technicalImpact"
                placeholder="Technical consequences..."
                rows={3}
                {...register('technicalImpact')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendedFix">Recommended Fix</Label>
              <Textarea
                id="recommendedFix"
                placeholder="Remediation steps..."
                rows={4}
                {...register('recommendedFix')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cvssScore">CVSS Score (0-10)</Label>
                <Input
                  id="cvssScore"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  {...register('cvssScore', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owaspCategory">OWASP Category</Label>
                <Input
                  id="owaspCategory"
                  placeholder="e.g., A03:2021"
                  {...register('owaspCategory')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvssVector">CVSS Vector</Label>
              <Input
                id="cvssVector"
                placeholder="e.g., CVSS:3.1/AV:N/AC:L/..."
                {...register('cvssVector')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/findings/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
