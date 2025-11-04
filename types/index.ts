// Database Types
export type {
  User,
  Company,
  Target,
  Pentest,
  Finding,
  FindingTemplate,
  Comment,
  Report,
  Notification,
  ActivityLog,
  ApiKey,
  UserRole,
  TargetType,
  CriticalityLevel,
  PentestStatus,
  Severity,
  FindingStatus,
  ReportType,
  ReportFormat,
  NotificationType,
  ActivityType,
} from '@prisma/client';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard Types
export interface DashboardStats {
  criticalFindings: number;
  activePentests: number;
  highRiskTargets: number;
  totalFindings: number;
  openFindings: number;
  resolvedFindings: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// Filter Types
export interface FilterOptions {
  search?: string;
  status?: string;
  severity?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
}

export interface TargetFormData {
  name: string;
  description?: string;
  url?: string;
  ipAddress?: string;
  targetType: string;
  criticalityLevel: string;
  technologyStack: string[];
  businessImpact?: string;
  owner?: string;
  nextAssessment?: Date;
}

export interface PentestFormData {
  title: string;
  description?: string;
  scope?: string;
  startDate: Date;
  endDate: Date;
  status: string;
  methodology?: string;
  complianceFrameworks: string[];
  assigneeIds: string[];
  targetIds: string[];
}

export interface FindingFormData {
  title: string;
  description: string;
  severity: string;
  status: string;
  cvssScore?: number;
  cvssVector?: string;
  reproductionSteps?: string;
  proofOfConcept?: string;
  businessImpact?: string;
  technicalImpact?: string;
  likelihood?: string;
  affectedAssets: string[];
  owaspCategory?: string;
  recommendedFix?: string;
  remediationPriority?: string;
  fixDeadline?: Date;
  targetId: string;
  assigneeId?: string;
}

// Table Column Types
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

// Notification Types
export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// Activity Log Types
export interface ActivityLogData {
  id: string;
  type: string;
  entity: string;
  action: string;
  user: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
}
