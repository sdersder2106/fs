'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, User, Calendar, ExternalLink } from 'lucide-react';
import { Button, Tabs, TabPanel } from '@/components/ui';
import Badge from '@/components/ui/Badge';

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: string;
  cvssScore: number;
  status: string;
  category: string | null;
  proofOfConcept: string | null;
  affectedUrls: string[];
  reproductionSteps: string | null;
  requestExample: string | null;
  responseExample: string | null;
  evidenceImages: string[];
  remediation: string | null;
  remediationCode: string | null;
  references: string[];
  firstFound: string | null;
  dueDate: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
  };
  pentest: {
    id: string;
    title: string;
    status: string;
  };
  target: {
    id: string;
    name: string;
    type: string;
    url: string | null;
  };
  reporter: {
    id: string;
    fullName: string;
    email: string;
    avatar: string | null;
  };
  assignedTo: {
    id: string;
    fullName: string;
    avatar: string | null;
  } | null;
  comments: Array<{
    id: string;
    text: string;
    createdAt: string;
    author: {
      id: string;
      fullName: string;
      avatar: string | null;
    };
  }>;
}

export default function FindingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchFinding();
  }, [params.id]);

  const fetchFinding = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/findings/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setFinding(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch finding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this finding?')) return;

    try {
      const res = await fetch(`/api/findings/${params.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/dashboard/findings');
      }
    } catch (error) {
      console.error('Failed to delete finding:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          findingId: params.id,
        }),
      });

      if (res.ok) {
        setNewComment('');
        fetchFinding();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
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

  if (!finding) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Finding not found</p>
        <Link href="/dashboard/findings">
          <Button variant="primary" className="mt-4">Back to Findings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/findings">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Finding Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={getSeverityColor(finding.severity)} className="text-base">
                {finding.severity}
              </Badge>
              <span className="text-lg font-semibold text-gray-900">
                CVSS {finding.cvssScore}
              </span>
              {finding.category && (
                <Badge variant="gray">{finding.category}</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{finding.title}</h1>
            <p className="text-gray-600">{finding.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/findings/${finding.id}/edit`}>
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

        {/* Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <Badge variant="blue">{finding.status.replace('_', ' ')}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Reported By</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                {finding.reporter.avatar ? (
                  <img src={finding.reporter.avatar} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  finding.reporter.fullName.charAt(0)
                )}
              </div>
              <span className="text-sm font-medium text-gray-900">{finding.reporter.fullName}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Assigned To</p>
            {finding.assignedTo ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                  {finding.assignedTo.avatar ? (
                    <img src={finding.assignedTo.avatar} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    finding.assignedTo.fullName.charAt(0)
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">{finding.assignedTo.fullName}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Unassigned</span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Found On</p>
            <span className="text-sm font-medium text-gray-900">
              {new Date(finding.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Context */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Pentest</p>
            <Link href={`/dashboard/pentests/${finding.pentest.id}`}>
              <p className="font-medium text-blue-600 hover:underline">{finding.pentest.title}</p>
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Target</p>
            <Link href={`/dashboard/targets/${finding.target.id}`}>
              <p className="font-medium text-blue-600 hover:underline">{finding.target.name}</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <TabPanel id="details" label="Details">
          <div className="space-y-6">
            {/* Affected URLs */}
            {finding.affectedUrls.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Affected URLs</h3>
                <div className="space-y-2">
                  {finding.affectedUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Proof of Concept */}
            {finding.proofOfConcept && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proof of Concept</h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  {finding.proofOfConcept}
                </pre>
              </div>
            )}

            {/* Reproduction Steps */}
            {finding.reproductionSteps && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reproduction Steps</h3>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{finding.reproductionSteps}</p>
                </div>
              </div>
            )}

            {/* Evidence Images */}
            {finding.evidenceImages.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {finding.evidenceImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Evidence ${index + 1}`}
                      className="rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel id="remediation" label="Remediation">
          <div className="space-y-6">
            {finding.remediation && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Remediation Guide</h3>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{finding.remediation}</p>
                </div>
              </div>
            )}

            {finding.remediationCode && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Example</h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  {finding.remediationCode}
                </pre>
              </div>
            )}

            {finding.references.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">References</h3>
                <ul className="space-y-2">
                  {finding.references.map((ref, index) => (
                    <li key={index} className="text-blue-600 hover:underline">
                      {ref.startsWith('http') ? (
                        <a href={ref} target="_blank" rel="noopener noreferrer">
                          {ref}
                        </a>
                      ) : (
                        <span>{ref}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel id="comments" label={`Comments (${finding.comments.length})`}>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" variant="primary" disabled={!newComment.trim()}>
                  Add Comment
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {finding.comments.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No comments yet</p>
              ) : (
                finding.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {comment.author.avatar ? (
                        <img src={comment.author.avatar} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {comment.author.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author.fullName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
