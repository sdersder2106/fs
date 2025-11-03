import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return formatDate(d);
}

/**
 * Get severity color classes
 */
export function getSeverityColor(severity: string): string {
  const severityLower = severity.toLowerCase();
  switch (severityLower) {
    case 'critical':
      return 'text-critical bg-critical-light border-critical';
    case 'high':
      return 'text-high bg-high-light border-high';
    case 'medium':
      return 'text-medium bg-medium-light border-medium';
    case 'low':
      return 'text-low bg-low-light border-low';
    case 'info':
      return 'text-info bg-info-light border-gray-300';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300';
  }
}

/**
 * Get status color classes
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase().replace(/_/g, '-');
  switch (statusLower) {
    case 'open':
    case 'scheduled':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'assigned':
    case 'in-progress':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'fix-submitted':
    case 'pending-validation':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'validated':
    case 'resolved':
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'closed':
    case 'cancelled':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'reopened':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'wont-fix':
    case 'false-positive':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

/**
 * Format status text (convert SNAKE_CASE to Title Case)
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calculate days until deadline
 */
export function getDaysUntilDeadline(deadline: Date | string): number {
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if deadline is approaching (within 3 days)
 */
export function isDeadlineApproaching(deadline: Date | string): boolean {
  const days = getDaysUntilDeadline(deadline);
  return days >= 0 && days <= 3;
}

/**
 * Check if deadline is breached
 */
export function isDeadlineBreached(deadline: Date | string): boolean {
  const days = getDaysUntilDeadline(deadline);
  return days < 0;
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Check if file is image
 */
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
