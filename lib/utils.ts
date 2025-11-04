import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(d);
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-critical text-critical-foreground',
    HIGH: 'bg-danger text-danger-foreground',
    MEDIUM: 'bg-warning text-warning-foreground',
    LOW: 'bg-info text-info-foreground',
    INFORMATIONAL: 'bg-muted text-muted-foreground',
  };
  
  return colors[severity] || colors.INFORMATIONAL;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: 'bg-danger text-danger-foreground',
    IN_PROGRESS: 'bg-warning text-warning-foreground',
    RESOLVED: 'bg-success text-success-foreground',
    ACCEPTED: 'bg-muted text-muted-foreground',
    FALSE_POSITIVE: 'bg-muted text-muted-foreground',
    PLANNED: 'bg-muted text-muted-foreground',
    REVIEW: 'bg-info text-info-foreground',
    COMPLETED: 'bg-success text-success-foreground',
    ARCHIVED: 'bg-muted text-muted-foreground',
  };
  
  return colors[status] || colors.OPEN;
}

export function getCriticalityColor(level: string): string {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-critical text-critical-foreground',
    HIGH: 'bg-danger text-danger-foreground',
    MEDIUM: 'bg-warning text-warning-foreground',
    LOW: 'bg-info text-info-foreground',
  };
  
  return colors[level] || colors.MEDIUM;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function calculateRiskScore(severity: string, likelihood: string): number {
  const severityScores: Record<string, number> = {
    CRITICAL: 10,
    HIGH: 7.5,
    MEDIUM: 5,
    LOW: 2.5,
    INFORMATIONAL: 1,
  };

  const likelihoodScores: Record<string, number> = {
    HIGH: 1,
    MEDIUM: 0.7,
    LOW: 0.4,
  };

  const severityScore = severityScores[severity] || 5;
  const likelihoodScore = likelihoodScores[likelihood.toUpperCase()] || 0.7;

  return severityScore * likelihoodScore;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function parseQueryParams(searchParams: URLSearchParams) {
  const params: Record<string, any> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

export function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}
