import { User, Company, Target, Pentest, Finding, Comment, Report, ComplianceResult } from '@prisma/client';

// ============================================
// EXTENDED TYPES (WITH RELATIONS)
// ============================================

export type UserWithCompany = User & {
  company: Company | null;
};

export type TargetWithRelations = Target & {
  company: Company;
  pentests: Pentest[];
  findings: Finding[];
};

export type PentestWithRelations = Pentest & {
  target: Target;
  company: Company;
  findings: Finding[];
  comments: Comment[];
};

export type FindingWithRelations = Finding & {
  pentest: Pentest;
  target: Target;
  company: Company;
  reporter: User;
  assignedTo: User | null;
  comments: Comment[];
};

export type CommentWithAuthor = Comment & {
  author: User;
};

export type ReportWithRelations = Report & {
  pentest: Pentest;
  company: Company;
  generator: User | null;
};

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// SESSION TYPES
// ============================================

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT';
  avatar?: string | null;
  companyId?: string | null;
  companyName?: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalPentests: number;
  activePentests: number;
  totalTargets: number;
  activeTargets: number;
  totalVulnerabilities: number;
  openVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  infoVulnerabilities: number;
}

export interface VulnerabilityByCategory {
  category: string;
  count: number;
}

export interface VulnerabilityBySeverity {
  severity: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  type: 'vulnerability' | 'comment' | 'status_change' | 'report';
  title: string;
  description: string;
  time: Date | string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  user?: {
    name: string;
    avatar?: string;
  };
}

// ============================================
// FILTER & SORT TYPES
// ============================================

export interface FindingFilters {
  severity?: string[];
  status?: string[];
  category?: string[];
  pentestId?: string;
  targetId?: string;
  companyId?: string;
  assignedToId?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'NEW_VULN' 
  | 'COMMENT' 
  | 'STATUS_CHANGE' 
  | 'DEADLINE' 
  | 'REPORT' 
  | 'ASSIGNMENT';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

// ============================================
// VULNERABILITY STATUS TYPES
// ============================================

export type VulnerabilityStatus = 
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'FIX_SUBMITTED'
  | 'PENDING_VALIDATION'
  | 'VALIDATED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'WONT_FIX'
  | 'FALSE_POSITIVE';

export type VulnerabilitySeverity = 
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFO';

// ============================================
// PENTEST STATUS TYPES
// ============================================

export type PentestStatus = 
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'REPORTED'
  | 'RESCAN'
  | 'COMPLETED'
  | 'CANCELLED';

// ============================================
// TARGET TYPES
// ============================================

export type TargetType = 
  | 'WEB_APP'
  | 'API'
  | 'CLOUD'
  | 'HOST';

export type TargetStatus = 
  | 'ACTIVE'
  | 'PENDING'
  | 'INACTIVE';

// ============================================
// REPORT TYPES
// ============================================

export type ReportType = 
  | 'EXECUTIVE'
  | 'TECHNICAL'
  | 'COMPLIANCE'
  | 'CUSTOM';

export type ReportStatus = 
  | 'DRAFT'
  | 'REVIEW'
  | 'FINAL';

// ============================================
// COMPLIANCE TYPES
// ============================================

export type ComplianceStandard = 
  | 'SOC2'
  | 'PCI_DSS'
  | 'ISO_27001'
  | 'GDPR'
  | 'HIPAA'
  | 'OWASP_2021';

// ============================================
// FILE UPLOAD TYPES
// ============================================

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface FileUploadResponse {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}
