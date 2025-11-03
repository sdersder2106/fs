// Re-export Prisma types
export type {
  User,
  Company,
  Target,
  Pentest,
  Finding,
  Comment,
  Report,
  Template,
  Notification,
} from '@prisma/client';

// Custom types for the application

// Auth types
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  companyName?: string;
  image?: string | null;
}

// Role types
export type UserRole = 'ADMIN' | 'PENTESTER' | 'CLIENT';

// Status types
export type PentestStatus = 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'REPORTED' 
  | 'RESCAN' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type FindingStatus = 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CLOSED';

export type TargetStatus = 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'ARCHIVED';

export type ReportStatus = 
  | 'DRAFT' 
  | 'FINAL' 
  | 'APPROVED';

// Severity types
export type FindingSeverity = 
  | 'CRITICAL' 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW' 
  | 'INFO';

// Type types
export type TargetType = 
  | 'WEB_APP' 
  | 'API' 
  | 'MOBILE_APP' 
  | 'CLOUD' 
  | 'HOST' 
  | 'NETWORK';

export type ReportType = 
  | 'EXECUTIVE' 
  | 'TECHNICAL' 
  | 'FULL';

export type ReportFormat = 
  | 'PDF' 
  | 'DOCX' 
  | 'HTML';

export type TemplateType = 
  | 'FINDING' 
  | 'REPORT';

export type NotificationType = 
  | 'INFO' 
  | 'WARNING' 
  | 'SUCCESS' 
  | 'ERROR';

// Dashboard types
export interface DashboardStats {
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  infoFindings: number;
  openFindings: number;
  inProgressFindings: number;
  resolvedFindings: number;
  totalPentests: number;
  activePentests: number;
  completedPentests: number;
  totalTargets: number;
  activeTargets: number;
  highRiskTargets: number;
  recentActivity: ActivityItem[];
  complianceStatus: ComplianceStatus[];
  findingsByCategory: CategoryCount[];
  findingsTrend: TrendData[];
  severityDistribution: SeverityCount[];
}

export interface ActivityItem {
  id: string;
  type: 'finding' | 'pentest' | 'comment' | 'report' | 'target';
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'started';
  title: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  link?: string;
}

export interface ComplianceStatus {
  standard: 'SOC2' | 'PCI-DSS' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'OWASP';
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  details: string;
}

export interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
}

export interface SeverityCount {
  severity: FindingSeverity;
  count: number;
  percentage: number;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface RadarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    pointBackgroundColor: string;
    pointBorderColor: string;
  }[];
}

export interface DonutChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

// Filter types
export interface FilterOptions {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PentestFilters extends FilterOptions {
  status?: PentestStatus;
  targetId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface FindingFilters extends FilterOptions {
  severity?: FindingSeverity;
  status?: FindingStatus;
  pentestId?: string;
  targetId?: string;
  assignedToId?: string;
  category?: string;
}

export interface TargetFilters extends FilterOptions {
  type?: TargetType;
  status?: TargetStatus;
  minRiskScore?: number;
  maxRiskScore?: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  companyName?: string;
  acceptTerms: boolean;
}

export interface ProfileForm {
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Upload types
export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Export data types
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields?: string[];
  filters?: any;
  includeRelations?: boolean;
}

// Audit log types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Settings types
export interface UserSettings {
  notifications: {
    email: boolean;
    browser: boolean;
    findings: boolean;
    pentests: boolean;
    reports: boolean;
    comments: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    density: 'compact' | 'comfortable' | 'spacious';
    language: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
}

export interface CompanySettings {
  general: {
    name: string;
    domain?: string;
    logo?: string;
    description?: string;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expirationDays: number;
    };
    sessionPolicy: {
      maxDuration: number;
      idleTimeout: number;
      maxConcurrentSessions: number;
    };
  };
  integrations: {
    slack?: {
      enabled: boolean;
      webhookUrl?: string;
      channels?: string[];
    };
    email?: {
      enabled: boolean;
      smtpHost?: string;
      smtpPort?: number;
      smtpUser?: string;
    };
  };
}

// Menu item types
export interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: MenuItem[];
  requiredRole?: UserRole | UserRole[];
  divider?: boolean;
}

// Table column types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T) => React.ReactNode;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}

// Toast notification types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
