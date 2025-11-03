'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Bug,
  Shield,
  Target,
  AlertCircle,
  AlertTriangle,
  Info,
  Edit,
  Trash2,
  ChevronRight,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG = {
  CRITICAL: { 
    color: 'bg-red-100 text-red-700 border-red-200',
    bgColor: 'bg-red-50',
    icon: AlertCircle,
    label: 'Critical'
  },
  HIGH: { 
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    bgColor: 'bg-orange-50',
    icon: AlertTriangle,
    label: 'High'
  },
  MEDIUM: { 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    bgColor: 'bg-yellow-50',
    icon: AlertTriangle,
    label: 'Medium'
  },
  LOW: { 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    bgColor: 'bg-blue-50',
    icon: Info,
    label: 'Low'
  },
  INFO: { 
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    bgColor: 'bg-gray-50',
    icon: Info,
    label: 'Informational'
  },
};

const STATUS_CONFIG = {
  OPEN: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Open' },
  IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'In Progress' },
  RESOLVED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Resolved' },
  CLOSED: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Closed' },
};

export default function FindingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFinding();
    }
  }, [id]);

  const fetchFinding = async () => {
    try {
      const response = await fetch(`/api/findings/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setFinding(data.data);
      }
    } catch (error) {
      console.error('Error fetching finding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/findings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/findings');
      } else {
        alert('Cannot delete resolved or closed findings');
      }
    } catch (error) {
      console.error('Error deleting finding:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/findings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchFinding();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: commentText,
          findingId: id,
        }),
      });

      if (response.ok) {
        setCommentText('');
        fetchFinding();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const copyToClipboard = (text: string, codeId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Bug className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Finding not found</h3>
          <div className="mt-6">
            <Link
              href="/dashboard/findings"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Back to Findings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const severityConfig = SEVERITY_CONFIG[finding.severity as keyof typeof SEVERITY_CONFIG];
  const SeverityIcon = severityConfig?.icon || Info;
  const statusConfig = STATUS_CONFIG[finding.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig?.icon || AlertCircle;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Link
              href="/dashboard/findings"
              className="text-gray-400 hover:text-gray-600 mt-1"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className={cn("p-2 rounded-lg", severityConfig?.color)}>
                  <SeverityIcon className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{finding.title}</h1>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Reported by {finding.reporter?.fullName}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(finding.createdAt).toLocaleDateString()}
                </span>
                {finding.stats?.daysSinceCreated > 0 && (
                  <span className={cn(
                    "flex items-center",
                    finding.stats.isOverdue && "text-red-600 font-medium"
                  )}>
                    {finding.stats.isOverdue && <AlertCircle className="h-4 w-4 mr-1" />}
                    {finding.stats.daysSinceCreated} days old
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={finding.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={cn(
                "text-sm font-medium rounded-md px-3 py-1.5 border-0",
                statusConfig?.color
              )}
            >
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <Link
              href={`/dashboard/findings/${id}/edit`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            {finding.status === 'OPEN' && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Information Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-gray-500">Severity</p>
            <p className={cn("text-sm font-medium", severityConfig?.color, "inline-block px-2 py-1 rounded mt-1")}>
              {severityConfig?.label}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">CVSS Score</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{finding.cvssScore || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{finding.category || 'Uncategorized'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Target</p>
            <Link
              href={`/dashboard/targets/${finding.target?.id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mt-1 inline-block"
            >
              {finding.target?.name}
            </Link>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pentest</p>
            <Link
              href={`/dashboard/pentests/${finding.pentest?.id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mt-1 inline-block"
            >
              {finding.pentest?.title}
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['details', 'evidence', 'remediation', 'comments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-2 px-6 border-b-2 font-medium text-sm capitalize",
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab}
                {tab === 'comments' && finding.comments?.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {finding.comments.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className={cn("p-4 rounded-lg", severityConfig?.bgColor)}>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{finding.description}</p>
                </div>
              </div>

              {finding.assignedTo && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Assignment</h3>
                  <div className="flex items-center space-x-3">
                    {finding.assignedTo.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={finding.assignedTo.avatar}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{finding.assignedTo.fullName}</p>
                      <p className="text-xs text-gray-500">{finding.assignedTo.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {finding.relatedFindings?.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Related Findings</h3>
                  <div className="space-y-2">
                    {finding.relatedFindings.map((related: any) => (
                      <Link
                        key={related.id}
                        href={`/dashboard/findings/${related.id}`}
                        className="block p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded",
                              SEVERITY_CONFIG[related.severity as keyof typeof SEVERITY_CONFIG]?.color
                            )}>
                              {related.severity}
                            </span>
                            <span className="text-sm text-gray-900">{related.title}</span>
                          </div>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded",
                            STATUS_CONFIG[related.status as keyof typeof STATUS_CONFIG]?.color
                          )}>
                            {related.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {finding.proofOfConcept && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Proof of Concept</h3>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
                      <code>{finding.proofOfConcept}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(finding.proofOfConcept, 'poc')}
                      className="absolute top-2 right-2 p-2 bg-gray-800 rounded hover:bg-gray-700"
                    >
                      {copiedCode === 'poc' ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {finding.reproductionSteps && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Reproduction Steps</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ol className="list-decimal list-inside space-y-2">
                      {finding.reproductionSteps.split('\n').map((step: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {finding.requestExample && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Request Example</h3>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs overflow-x-auto">
                        <code>{finding.requestExample}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(finding.requestExample, 'request')}
                        className="absolute top-2 right-2 p-1 bg-gray-800 rounded hover:bg-gray-700"
                      >
                        {copiedCode === 'request' ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {finding.responseExample && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Response Example</h3>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs overflow-x-auto">
                        <code>{finding.responseExample}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(finding.responseExample, 'response')}
                        className="absolute top-2 right-2 p-1 bg-gray-800 rounded hover:bg-gray-700"
                      >
                        {copiedCode === 'response' ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {finding.evidenceImages?.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Evidence Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finding.evidenceImages.map((imageUrl: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Evidence ${index + 1}`}
                          className="rounded-lg border shadow-sm"
                        />
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ExternalLink className="h-6 w-6 text-white" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remediation Tab */}
          {activeTab === 'remediation' && (
            <div className="space-y-6">
              {finding.remediation && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Remediation Recommendation</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{finding.remediation}</p>
                  </div>
                </div>
              )}

              {finding.remediationCode && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Remediation Code Example</h3>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
                      <code>{finding.remediationCode}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(finding.remediationCode, 'remediation')}
                      className="absolute top-2 right-2 p-2 bg-gray-800 rounded hover:bg-gray-700"
                    >
                      {copiedCode === 'remediation' ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {finding.references?.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">References</h3>
                  <ul className="space-y-2">
                    {finding.references.map((ref: string, index: number) => (
                      <li key={index}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          {ref}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Discussion ({finding.comments?.length || 0})
              </h3>
              
              {finding.comments?.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {finding.comments.map((comment: any) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        {comment.author?.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={comment.author.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.author?.fullName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No comments yet. Start the discussion!</p>
                </div>
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="border-t pt-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Add Comment
                </label>
                <div className="flex space-x-3">
                  <textarea
                    id="comment"
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts or updates..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className={cn(
                      "px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white",
                      submittingComment || !commentText.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    )}
                  >
                    {submittingComment ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Finding</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this finding? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
