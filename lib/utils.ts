import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';

// Tailwind CSS class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date functions
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  return format(dateObj, 'PPP');
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  return format(dateObj, 'PPP p');
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  return format(dateObj, 'MMM d, yyyy');
}

// Severity color mapping
export function getSeverityColor(severity: string): string {
  const colors = {
    CRITICAL: 'text-red-700 bg-red-50 border-red-200',
    HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
    MEDIUM: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    LOW: 'text-blue-700 bg-blue-50 border-blue-200',
    INFO: 'text-gray-700 bg-gray-50 border-gray-300',
  };
  
  return colors[severity as keyof typeof colors] || colors.INFO;
}

export function getSeverityBgColor(severity: string): string {
  const colors = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-blue-500',
    INFO: 'bg-gray-500',
  };
  
  return colors[severity as keyof typeof colors] || colors.INFO;
}

export function getSeverityTextColor(severity: string): string {
  const colors = {
    CRITICAL: 'text-red-600',
    HIGH: 'text-orange-600',
    MEDIUM: 'text-yellow-600',
    LOW: 'text-blue-600',
    INFO: 'text-gray-600',
  };
  
  return colors[severity as keyof typeof colors] || colors.INFO;
}

// Status color mapping
export function getStatusColor(status: string): string {
  const colors = {
    // Pentest status
    SCHEDULED: 'text-blue-700 bg-blue-50 border-blue-200',
    IN_PROGRESS: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    REPORTED: 'text-purple-700 bg-purple-50 border-purple-200',
    RESCAN: 'text-orange-700 bg-orange-50 border-orange-200',
    COMPLETED: 'text-green-700 bg-green-50 border-green-200',
    CANCELLED: 'text-gray-700 bg-gray-50 border-gray-300',
    
    // Finding status
    OPEN: 'text-red-700 bg-red-50 border-red-200',
    RESOLVED: 'text-green-700 bg-green-50 border-green-200',
    CLOSED: 'text-gray-700 bg-gray-50 border-gray-300',
    
    // Target status
    ACTIVE: 'text-green-700 bg-green-50 border-green-200',
    INACTIVE: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    ARCHIVED: 'text-gray-700 bg-gray-50 border-gray-300',
    
    // Report status
    DRAFT: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    FINAL: 'text-blue-700 bg-blue-50 border-blue-200',
    APPROVED: 'text-green-700 bg-green-50 border-green-200',
  };
  
  return colors[status as keyof typeof colors] || 'text-gray-700 bg-gray-50 border-gray-300';
}

// Type color mapping
export function getTypeColor(type: string): string {
  const colors = {
    // Target types
    WEB_APP: 'text-blue-700 bg-blue-50 border-blue-200',
    API: 'text-purple-700 bg-purple-50 border-purple-200',
    MOBILE_APP: 'text-green-700 bg-green-50 border-green-200',
    CLOUD: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    HOST: 'text-orange-700 bg-orange-50 border-orange-200',
    NETWORK: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    
    // Report types
    EXECUTIVE: 'text-purple-700 bg-purple-50 border-purple-200',
    TECHNICAL: 'text-blue-700 bg-blue-50 border-blue-200',
    FULL: 'text-green-700 bg-green-50 border-green-200',
    
    // Notification types
    INFO: 'text-blue-700 bg-blue-50 border-blue-200',
    WARNING: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    SUCCESS: 'text-green-700 bg-green-50 border-green-200',
    ERROR: 'text-red-700 bg-red-50 border-red-200',
  };
  
  return colors[type as keyof typeof colors] || 'text-gray-700 bg-gray-50 border-gray-300';
}

// Role color mapping
export function getRoleColor(role: string): string {
  const colors = {
    ADMIN: 'text-purple-700 bg-purple-50 border-purple-200',
    PENTESTER: 'text-blue-700 bg-blue-50 border-blue-200',
    CLIENT: 'text-green-700 bg-green-50 border-green-200',
  };
  
  return colors[role as keyof typeof colors] || 'text-gray-700 bg-gray-50 border-gray-300';
}

// Generate initials from name
export function getInitials(name: string): string {
  if (!name) return 'UN';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Calculate risk score color
export function getRiskScoreColor(score: number): string {
  if (score >= 80) return 'text-red-600 bg-red-50';
  if (score >= 60) return 'text-orange-600 bg-orange-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  if (score >= 20) return 'text-blue-600 bg-blue-50';
  return 'text-green-600 bg-green-50';
}

// Calculate progress color
export function getProgressColor(progress: number): string {
  if (progress === 100) return 'bg-green-500';
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

// Truncate text
export function truncate(text: string, length: number = 50): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Check if email is valid
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if URL is valid
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Parse JSON safely
export function parseJSON<T>(json: string | null): T | null {
  if (!json) return null;
  
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Calculate CVSS color
export function getCVSSColor(score: number): string {
  if (score >= 9.0) return 'text-red-600';
  if (score >= 7.0) return 'text-orange-600';
  if (score >= 4.0) return 'text-yellow-600';
  if (score >= 0.1) return 'text-blue-600';
  return 'text-gray-600';
}

// Format CVSS score
export function formatCVSS(score: number): string {
  return score.toFixed(1);
}

// Calculate severity from CVSS
export function getSeverityFromCVSS(score: number): string {
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  if (score >= 0.1) return 'LOW';
  return 'INFO';
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Sort array by key
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value}%`;
}

// Check if dark mode
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Download file
export function downloadFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
