'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  Calendar,
  MessageSquare,
  Send,
  FileText,
  Target as TargetIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/ui/loading';
import { toast } from 'sonner';
import { formatDate, formatRelativeTime, getSeverityColor, getStatusColor } from '@/lib/utils';
import { AdminOnly, AuditorOnly } from '@/components/auth/role-guard';
import { useAuth } from '@/hooks/use-auth';

export default function FindingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchFinding();
  }, [params.id]);

  const fetchFinding = async () => {
    try {
      const response = await fetch(`/api/findings/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFinding(data);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this finding?')) return;

    try {
      const response = await fetch(`/api/findings/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Finding deleted successfully');
        router.push('/findings');
      } else {
        toast.error('Failed to delete finding');
      }
    } catch (error) {
      console.error('Delete finding error:', error);
      toast.error('Failed to delete finding');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await fetch(`/api/findings/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText,
        }),
      });

      if (response.ok) {
        toast.success('Comment added');
        setCommentText('');
        fetchFinding();
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/findings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={getSeverityColor(finding.severity)}>
                {finding.severity}
              </Badge>
              <Badge className={getStatusColor(finding.status)}>
                {finding.status.replace('_', ' ')}
              </Badge>
              {finding.cvssScore && (
                <Badge variant="outline">CVSS {finding.cvssScore.toFixed(1)}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">{finding.title}</h1>
            <p className="text-muted-foreground">
              Discovered by {finding.createdBy.name} • {formatDate(finding.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <AuditorOnly>
            <Link href={`/findings/${finding.id}/edit`}>
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

      {/* Context & Risk Assessment */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Pentest</p>
              <Link
                href={`/pentests/${finding.pentest.id}`}
                className="text-sm text-primary hover:underline flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {finding.pentest.title}
              </Link>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Target</p>
              <Link
                href={`/targets/${finding.target.id}`}
                className="text-sm text-primary hover:underline flex items-center gap-2"
              >
                <TargetIcon className="h-4 w-4" />
                {finding.target.name}
              </Link>
            </div>

            {finding.assignee && (
              <div>
                <p className="text-sm font-medium mb-1">Assigned To</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={finding.assignee.avatar} />
                    <AvatarFallback className="text-xs">
                      {finding.assignee.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{finding.assignee.name}</span>
                </div>
              </div>
            )}

            {finding.owaspCategory && (
              <div>
                <p className="text-sm font-medium mb-1">OWASP Category</p>
                <Badge variant="secondary">{finding.owaspCategory}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {finding.cvssVector && (
              <div>
                <p className="text-sm font-medium mb-1">CVSS Vector</p>
                <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                  {finding.cvssVector}
                </code>
              </div>
            )}

            {finding.riskScore && (
              <div>
                <p className="text-sm font-medium mb-1">Risk Score</p>
                <p className="text-sm text-muted-foreground">
                  {finding.riskScore.toFixed(1)} / 10
                </p>
              </div>
            )}

            {finding.likelihood && (
              <div>
                <p className="text-sm font-medium mb-1">Likelihood</p>
                <Badge variant="outline">{finding.likelihood}</Badge>
              </div>
            )}

            {finding.fixDeadline && (
              <div>
                <p className="text-sm font-medium mb-1">Fix Deadline</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(finding.fixDeadline)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{finding.description}</p>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {finding.reproductionSteps && (
          <Card>
            <CardHeader>
              <CardTitle>Reproduction Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{finding.reproductionSteps}</p>
            </CardContent>
          </Card>
        )}

        {finding.proofOfConcept && (
          <Card>
            <CardHeader>
              <CardTitle>Proof of Concept</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {finding.proofOfConcept}
              </pre>
            </CardContent>
          </Card>
        )}

        {finding.businessImpact && (
          <Card>
            <CardHeader>
              <CardTitle>Business Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{finding.businessImpact}</p>
            </CardContent>
          </Card>
        )}

        {finding.technicalImpact && (
          <Card>
            <CardHeader>
              <CardTitle>Technical Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{finding.technicalImpact}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Affected Assets */}
      {finding.affectedAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Affected Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {finding.affectedAssets.map((asset: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {asset}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remediation */}
      {finding.recommendedFix && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Fix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{finding.recommendedFix}</p>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({finding.comments.length})</CardTitle>
          <CardDescription>
            Collaborate and discuss this finding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {finding.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              finding.comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {comment.author.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.author.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {comment.author.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs">
                  {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment... (Use @username to mention someone)"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!commentText.trim() || submittingComment}>
                {submittingComment ? (
                  <>Posting...</>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
