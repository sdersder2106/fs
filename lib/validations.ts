import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Company schemas
export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  domain: z.string().optional(),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  description: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

// User schemas
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

// Pentest schemas
export const createPentestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'REPORTED', 'RESCAN', 'COMPLETED', 'CANCELLED']),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  methodology: z.string().optional(),
  targetId: z.string().cuid(),
  companyId: z.string().cuid(),
});

export const updatePentestSchema = createPentestSchema.partial().extend({
  id: z.string().cuid(),
});

// Target schemas
export const createTargetSchema = z.object({
  name: z.string().min(2, 'Target name must be at least 2 characters'),
  type: z.enum(['WEB_APP', 'API', 'MOBILE_APP', 'CLOUD', 'HOST', 'NETWORK']),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  ipAddress: z.string()
    .regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/\d{1,2})?$/, 'Invalid IP address')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  riskScore: z.number().min(0).max(100).default(0),
  scope: z.any().optional(), // JSON field
  companyId: z.string().cuid(),
});

export const updateTargetSchema = createTargetSchema.partial().extend({
  id: z.string().cuid(),
});

// Finding schemas
export const createFindingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
  cvssScore: z.number().min(0).max(10),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).default('OPEN'),
  category: z.string().optional(),
  
  // Evidence fields
  proofOfConcept: z.string().optional(),
  reproductionSteps: z.string().optional(),
  requestExample: z.string().optional(),
  responseExample: z.string().optional(),
  evidenceImages: z.array(z.string().url()).optional().default([]),
  
  // Remediation fields
  remediation: z.string().optional(),
  remediationCode: z.string().optional(),
  references: z.array(z.string().url()).optional().default([]),
  
  // Relations
  pentestId: z.string().cuid(),
  targetId: z.string().cuid(),
  companyId: z.string().cuid(),
  reporterId: z.string().cuid(),
  assignedToId: z.string().cuid().optional(),
});

export const updateFindingSchema = createFindingSchema.partial().extend({
  id: z.string().cuid(),
});

// Comment schemas
export const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment too long'),
  pentestId: z.string().cuid().optional(),
  findingId: z.string().cuid().optional(),
  authorId: z.string().cuid(),
}).refine(data => data.pentestId || data.findingId, {
  message: 'Comment must be associated with either a pentest or finding',
});

export const updateCommentSchema = z.object({
  id: z.string().cuid(),
  text: z.string().min(1).max(5000),
});

// Report schemas
export const createReportSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  reportType: z.enum(['EXECUTIVE', 'TECHNICAL', 'FULL']),
  status: z.enum(['DRAFT', 'FINAL', 'APPROVED']).default('DRAFT'),
  format: z.enum(['PDF', 'DOCX', 'HTML']),
  fileUrl: z.string().url().optional().or(z.literal('')),
  pentestId: z.string().cuid(),
  companyId: z.string().cuid(),
  generatedBy: z.string().cuid(), // Note: NOT generatorId
});

export const updateReportSchema = createReportSchema.partial().extend({
  id: z.string().cuid(),
});

// Template schemas
export const createTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['FINDING', 'REPORT']),
  category: z.string().optional(),
  content: z.string().min(10, 'Template content must be at least 10 characters'),
  isPublic: z.boolean().default(false),
  companyId: z.string().cuid(),
});

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string().cuid(),
});

// Notification schemas
export const createNotificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).default('INFO'),
  link: z.string().optional(),
  userId: z.string().cuid(),
});

export const markNotificationReadSchema = z.object({
  id: z.string().cuid(),
  isRead: z.boolean().default(true),
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const filterPentestsSchema = searchSchema.extend({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'REPORTED', 'RESCAN', 'COMPLETED', 'CANCELLED']).optional(),
  targetId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const filterFindingsSchema = searchSchema.extend({
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  pentestId: z.string().cuid().optional(),
  targetId: z.string().cuid().optional(),
  assignedToId: z.string().cuid().optional(),
  category: z.string().optional(),
});

export const filterTargetsSchema = searchSchema.extend({
  type: z.enum(['WEB_APP', 'API', 'MOBILE_APP', 'CLOUD', 'HOST', 'NETWORK']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  minRiskScore: z.number().min(0).max(100).optional(),
  maxRiskScore: z.number().min(0).max(100).optional(),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.any(),
  type: z.enum(['image', 'document', 'evidence', 'logo', 'avatar']).optional(),
  maxSize: z.number().default(10485760), // 10MB default
});

// Dashboard stats schema
export const dashboardStatsSchema = z.object({
  companyId: z.string().cuid(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Bulk operations schemas
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'Select at least one item'),
});

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
  status: z.string(),
});

// Export schemas
export const exportDataSchema = z.object({
  type: z.enum(['findings', 'pentests', 'targets', 'reports']),
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  filters: z.any().optional(),
});

// Type exports from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreatePentestInput = z.infer<typeof createPentestSchema>;
export type UpdatePentestInput = z.infer<typeof updatePentestSchema>;
export type CreateTargetInput = z.infer<typeof createTargetSchema>;
export type UpdateTargetInput = z.infer<typeof updateTargetSchema>;
export type CreateFindingInput = z.infer<typeof createFindingSchema>;
export type UpdateFindingInput = z.infer<typeof updateFindingSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type FilterPentestsInput = z.infer<typeof filterPentestsSchema>;
export type FilterFindingsInput = z.infer<typeof filterFindingsSchema>;
export type FilterTargetsInput = z.infer<typeof filterTargetsSchema>;
