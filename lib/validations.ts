import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().optional(),
  role: z.enum(['ADMIN', 'CLIENT']).default('CLIENT'),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// COMPANY SCHEMAS
// ============================================

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  logo: z.string().url().optional(),
  industry: z.string().optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  logo: z.string().url().optional(),
  industry: z.string().optional(),
});

// ============================================
// TARGET SCHEMAS
// ============================================

export const createTargetSchema = z.object({
  name: z.string().min(2, 'Target name is required'),
  description: z.string().optional(),
  type: z.enum(['WEB_APP', 'API', 'CLOUD', 'HOST']),
  url: z.string().url().optional(),
  ipAddress: z.string().ip().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'INACTIVE']).default('PENDING'),
  riskScore: z.number().min(0).max(100).default(0),
  scope: z.array(z.string()).default([]),
  companyId: z.string().cuid(),
});

export const updateTargetSchema = createTargetSchema.partial().omit({ companyId: true });

// ============================================
// PENTEST SCHEMAS
// ============================================

export const createPentestSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'REPORTED', 'RESCAN', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  targetId: z.string().cuid(),
  companyId: z.string().cuid(),
});

export const updatePentestSchema = createPentestSchema.partial().omit({ companyId: true });

// ============================================
// FINDING (VULNERABILITY) SCHEMAS
// ============================================

export const createFindingSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
  cvssScore: z.number().min(0).max(10),
  status: z.enum([
    'OPEN',
    'ASSIGNED',
    'IN_PROGRESS',
    'FIX_SUBMITTED',
    'PENDING_VALIDATION',
    'VALIDATED',
    'RESOLVED',
    'CLOSED',
    'REOPENED',
    'WONT_FIX',
    'FALSE_POSITIVE'
  ]).default('OPEN'),
  category: z.string().optional(),
  
  // Evidence
  proofOfConcept: z.string().optional(),
  affectedUrls: z.array(z.string()).default([]),
  reproductionSteps: z.string().optional(),
  requestExample: z.string().optional(),
  responseExample: z.string().optional(),
  evidenceImages: z.array(z.string()).default([]),
  
  // Remediation
  remediation: z.string().optional(),
  remediationCode: z.string().optional(),
  references: z.array(z.string()).default([]),
  
  // Relations
  pentestId: z.string().cuid(),
  targetId: z.string().cuid(),
  companyId: z.string().cuid(),
  reporterId: z.string().cuid(),
  assignedToId: z.string().cuid().optional(),
  
  // Dates
  firstFound: z.string().datetime().or(z.date()).optional(),
  dueDate: z.string().datetime().or(z.date()).optional(),
});

export const updateFindingSchema = createFindingSchema.partial().omit({ 
  companyId: true, 
  reporterId: true 
});

export const submitFixSchema = z.object({
  fixDescription: z.string().min(10, 'Fix description is required'),
  fixProofUrls: z.array(z.string()).default([]),
});

export const validateFixSchema = z.object({
  validationNotes: z.string().min(10, 'Validation notes are required'),
  approved: z.boolean(),
});

// ============================================
// COMMENT SCHEMAS
// ============================================

export const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment text is required'),
  authorId: z.string().cuid(),
  pentestId: z.string().cuid().optional(),
  findingId: z.string().cuid().optional(),
  targetId: z.string().cuid().optional(),
  attachments: z.array(z.string()).default([]),
}).refine(
  (data) => data.pentestId || data.findingId || data.targetId,
  { message: 'Comment must be associated with a pentest, finding, or target' }
);

export const updateCommentSchema = z.object({
  text: z.string().min(1).optional(),
});

// ============================================
// REPORT SCHEMAS
// ============================================

export const createReportSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  reportType: z.enum(['EXECUTIVE', 'TECHNICAL', 'COMPLIANCE', 'CUSTOM']).default('TECHNICAL'),
  status: z.enum(['DRAFT', 'REVIEW', 'FINAL']).default('DRAFT'),
  pentestId: z.string().cuid(),
  companyId: z.string().cuid(),
  sections: z.any().optional(),
  branding: z.any().optional(),
  executiveSummary: z.string().optional(),
  methodology: z.string().optional(),
});

export const updateReportSchema = createReportSchema.partial().omit({ 
  pentestId: true, 
  companyId: true 
});

// ============================================
// TEMPLATE SCHEMAS
// ============================================

export const createTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
  cvssScoreMin: z.number().min(0).max(10),
  cvssScoreMax: z.number().min(0).max(10),
  remediation: z.string(),
  remediationCode: z.string().optional(),
  references: z.array(z.string()).default([]),
  cweId: z.string().optional(),
  owaspCategory: z.string().optional(),
  isPublic: z.boolean().default(true),
  companyId: z.string().cuid().optional(),
});

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

export const createNotificationSchema = z.object({
  type: z.enum(['NEW_VULN', 'COMMENT', 'STATUS_CHANGE', 'DEADLINE', 'REPORT', 'ASSIGNMENT']),
  title: z.string().min(1),
  message: z.string(),
  link: z.string().optional(),
  userId: z.string().cuid(),
  metadata: z.any().optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
  notifyOnComment: z.boolean().optional(),
  notifyOnAssign: z.boolean().optional(),
  notifyOnStatus: z.boolean().optional(),
  notifyOnDeadline: z.boolean().optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateTargetInput = z.infer<typeof createTargetSchema>;
export type UpdateTargetInput = z.infer<typeof updateTargetSchema>;
export type CreatePentestInput = z.infer<typeof createPentestSchema>;
export type UpdatePentestInput = z.infer<typeof updatePentestSchema>;
export type CreateFindingInput = z.infer<typeof createFindingSchema>;
export type UpdateFindingInput = z.infer<typeof updateFindingSchema>;
export type SubmitFixInput = z.infer<typeof submitFixSchema>;
export type ValidateFixInput = z.infer<typeof validateFixSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;
