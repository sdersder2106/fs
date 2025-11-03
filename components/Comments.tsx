'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Send, User, Edit, Trash2, MoreVertical } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  createdAt: Date | string;
  updatedAt?: Date | string;
  isEdited?: boolean;
}

interface CommentsProps {
  comments: Comment[];
  currentUserId?: string;
  onAddComment: (text: string) => Promise<void> | void;
  onEditComment?: (id: string, text: string) => Promise<void> | void;
  onDeleteComment?: (id: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
}

const Comments: React.FC<CommentsProps> = ({
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  placeholder = 'Add a comment...',
  className,
}) => {
  const [newComment, setNewComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState('');
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
    setOpenMenuId(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim() || !onEditComment) return;
    
    try {
      await onEditComment(id, editText.trim());
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteComment) return;
    
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await onDeleteComment(id);
        setOpenMenuId(null);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-700',
      PENTESTER: 'bg-blue-100 text-blue-700',
      CLIENT: 'bg-green-100 text-green-700',
    };
    return role ? colors[role as keyof typeof colors] || '' : '';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Comment List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isAuthor = currentUserId === comment.author.id;
            const isEditing = editingId === comment.id;
            
            return (
              <div key={comment.id} className="flex space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.author.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          {comment.author.role && (
                            <span
                              className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded',
                                getRoleBadgeColor(comment.author.role)
                              )}
                            >
                              {comment.author.role}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                          {comment.isEdited && (
                            <span className="text-xs text-gray-400">(edited)</span>
                          )}
                        </div>
                      </div>
                      
                      {isAuthor && (onEditComment || onDeleteComment) && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(
                              openMenuId === comment.id ? null : comment.id
                            )}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          {openMenuId === comment.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              {onEditComment && (
                                <button
                                  onClick={() => handleEdit(comment)}
                                  className="flex items-center w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit className="w-3 h-3 mr-2" />
                                  Edit
                                </button>
                              )}
                              {onDeleteComment && (
                                <button
                                  onClick={() => handleDelete(comment.id)}
                                  className="flex items-center w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="mt-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full"
                          autoFocus
                        />
                        <div className="flex space-x-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={!editText.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full"
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                loading={isSubmitting}
                icon={<Send className="w-4 h-4" />}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Comments;
