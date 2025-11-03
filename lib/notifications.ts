import { prisma } from '@/lib/prisma';
import { NotificationType } from '@/types';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        metadata: params.metadata,
        isRead: false,
      },
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * Notify about a new vulnerability
 */
export async function notifyNewVulnerability(
  userId: string,
  findingId: string,
  findingTitle: string,
  severity: string
) {
  return createNotification({
    userId,
    type: 'NEW_VULN',
    title: 'New Vulnerability Found',
    message: `A ${severity} severity vulnerability was found: ${findingTitle}`,
    link: `/dashboard/findings/${findingId}`,
    metadata: { findingId, severity },
  });
}

/**
 * Notify about a new comment
 */
export async function notifyNewComment(
  userId: string,
  commentAuthor: string,
  resourceType: 'pentest' | 'finding' | 'target',
  resourceId: string,
  resourceTitle: string
) {
  return createNotification({
    userId,
    type: 'COMMENT',
    title: 'New Comment',
    message: `${commentAuthor} commented on ${resourceType}: ${resourceTitle}`,
    link: `/dashboard/${resourceType}s/${resourceId}`,
    metadata: { resourceType, resourceId },
  });
}

/**
 * Notify about status change
 */
export async function notifyStatusChange(
  userId: string,
  resourceType: 'pentest' | 'finding',
  resourceId: string,
  resourceTitle: string,
  oldStatus: string,
  newStatus: string
) {
  return createNotification({
    userId,
    type: 'STATUS_CHANGE',
    title: 'Status Updated',
    message: `${resourceType} "${resourceTitle}" status changed from ${oldStatus} to ${newStatus}`,
    link: `/dashboard/${resourceType}s/${resourceId}`,
    metadata: { resourceType, resourceId, oldStatus, newStatus },
  });
}

/**
 * Notify about assignment
 */
export async function notifyAssignment(
  userId: string,
  findingId: string,
  findingTitle: string,
  severity: string
) {
  return createNotification({
    userId,
    type: 'ASSIGNMENT',
    title: 'Vulnerability Assigned',
    message: `You have been assigned a ${severity} vulnerability: ${findingTitle}`,
    link: `/dashboard/findings/${findingId}`,
    metadata: { findingId, severity },
  });
}

/**
 * Notify about upcoming deadline
 */
export async function notifyDeadline(
  userId: string,
  findingId: string,
  findingTitle: string,
  dueDate: Date
) {
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return createNotification({
    userId,
    type: 'DEADLINE',
    title: 'Upcoming Deadline',
    message: `Vulnerability "${findingTitle}" is due in ${daysUntilDue} days`,
    link: `/dashboard/findings/${findingId}`,
    metadata: { findingId, dueDate, daysUntilDue },
  });
}

/**
 * Notify about report generation
 */
export async function notifyReportGenerated(
  userId: string,
  reportId: string,
  reportTitle: string,
  pentestId: string
) {
  return createNotification({
    userId,
    type: 'REPORT',
    title: 'Report Generated',
    message: `Report "${reportTitle}" has been generated and is ready for review`,
    link: `/dashboard/reports/${reportId}`,
    metadata: { reportId, pentestId },
  });
}

/**
 * Notify multiple users at once
 */
export async function notifyMultipleUsers(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  const promises = userIds.map((userId) =>
    createNotification({ ...params, userId })
  );

  return Promise.all(promises);
}

/**
 * Notification templates for common messages
 */
export const notificationTemplates = {
  reportGenerated: (reportTitle: string) => ({
    title: 'Report Generated',
    message: `Report "${reportTitle}" has been generated and is ready for review.`,
  }),
  vulnerabilityFound: (title: string, severity: string) => ({
    title: 'New Vulnerability Found',
    message: `A ${severity} severity vulnerability was found: ${title}`,
  }),
  statusChanged: (resource: string, oldStatus: string, newStatus: string) => ({
    title: 'Status Updated',
    message: `${resource} status changed from ${oldStatus} to ${newStatus}`,
  }),
};

/**
 * Notify all users of a company
 */
export async function notifyCompanyUsers(
  companyId: string,
  params: Omit<CreateNotificationParams, 'userId'>
) {
  // Get all users from the company
  const users = await prisma.user.findMany({
    where: { companyId },
    select: { id: true },
  });

  const userIds = users.map(u => u.id);
  return notifyMultipleUsers(userIds, params);
}

/**
 * Notification templates for common scenarios
 */
export const notificationTemplates = {
  REPORT_GENERATED: {
    type: 'REPORT' as const,
    title: 'Report Generated',
    getMessage: (reportTitle: string) => `Report "${reportTitle}" has been generated and is ready for review`
  },
  NEW_VULNERABILITY: {
    type: 'NEW_VULN' as const,
    title: 'New Vulnerability Found',
    getMessage: (severity: string, title: string) => `A ${severity} severity vulnerability was found: ${title}`
  },
  STATUS_CHANGED: {
    type: 'STATUS_CHANGE' as const,
    title: 'Status Updated',
    getMessage: (resourceType: string, title: string, oldStatus: string, newStatus: string) => 
      `${resourceType} "${title}" status changed from ${oldStatus} to ${newStatus}`
  }
};

/**
 * Notify all users in a company
 */
export async function notifyCompanyUsers(
  companyId: string,
  params: Omit<CreateNotificationParams, 'userId'>
) {
  const users = await prisma.user.findMany({
    where: { companyId },
    select: { id: true }
  });
  
  return notifyMultipleUsers(
    users.map(u => u.id),
    params
  );
}
