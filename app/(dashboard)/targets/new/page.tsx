'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const targetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  ipAddress: z.string().optional(),
  targetType: z.enum(['WEB_APPLICATION', 'API_ENDPOINT', 'NETWORK_INFRASTRUCTURE', 'MOBILE_APPLICATION', 'CLOUD_RESOURCES']),
  criticalityLevel: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  businessImpact: z.string().optional(),
  owner: z.string().optional(),
  nextAssessment: z.string().optional(),
});

type TargetFormData = z.infer<typeof targetSchema>;

export default function NewTargetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TargetFormData>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      targetType: 'WEB_APPLICATION',
      criticalityLevel: 'MEDIUM',
    },
  });

  const targetType = watch('targetType');

  const onSubmit = async (data: TargetFormData) => {
    try {
      setLoading(true);

      const response = await fetch('/api/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          technologyStack: techStack,
        }),
      });

      if (response.ok) {
        toast.success('Target created successfully');
        router.push('/targets');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create target');
      }
    } catch (error) {
      console.error('Create target error:', error);
      toast.error('Failed to create target');
    } finally {
      setLoading(false);
    }
  };

  const addTechnology = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/targets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Target</h1>
          <p className="text-muted-foreground">
            Add a new security assessment target
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Target Information</CardTitle>
            <CardDescription>
              Provide details about the target you want to assess
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Production API"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the target, its purpose, and any relevant context..."
                rows={4}
                {...register('description')}
              />
            </div>

            {/* Target Type */}
            <div className="space-y-2">
              <Label htmlFor="targetType">
                Target Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={targetType}
                onValueChange={(value) => setValue('targetType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB_APPLICATION">Web Application</SelectItem>
                  <SelectItem value="API_ENDPOINT">API Endpoint</SelectItem>
                  <SelectItem value="NETWORK_INFRASTRUCTURE">Network Infrastructure</SelectItem>
                  <SelectItem value="MOBILE_APPLICATION">Mobile Application</SelectItem>
                  <SelectItem value="CLOUD_RESOURCES">Cloud Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* URL / IP Address */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  {...register('url')}
                />
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  placeholder="192.168.1.1"
                  {...register('ipAddress')}
                />
              </div>
            </div>

            {/* Criticality Level */}
            <div className="space-y-2">
              <Label htmlFor="criticalityLevel">
                Criticality Level <span className="text-destructive">*</span>
              </Label>
              <Select
                defaultValue="MEDIUM"
                onValueChange={(value) => setValue('criticalityLevel', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select criticality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Technology Stack */}
            <div className="space-y-2">
              <Label htmlFor="techStack">Technology Stack</Label>
              <div className="flex gap-2">
                <Input
                  id="techStack"
                  placeholder="e.g., React, Node.js, PostgreSQL"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechnology();
                    }
                  }}
                />
                <Button type="button" onClick={addTechnology} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Business Impact */}
            <div className="space-y-2">
              <Label htmlFor="businessImpact">Business Impact</Label>
              <Textarea
                id="businessImpact"
                placeholder="Describe the business impact if this target is compromised..."
                rows={3}
                {...register('businessImpact')}
              />
            </div>

            {/* Owner */}
            <div className="space-y-2">
              <Label htmlFor="owner">Owner / Responsible Team</Label>
              <Input
                id="owner"
                placeholder="e.g., Security Team, DevOps"
                {...register('owner')}
              />
            </div>

            {/* Next Assessment */}
            <div className="space-y-2">
              <Label htmlFor="nextAssessment">Next Scheduled Assessment</Label>
              <Input
                id="nextAssessment"
                type="date"
                {...register('nextAssessment')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/targets">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Target
          </Button>
        </div>
      </form>
    </div>
  );
}
