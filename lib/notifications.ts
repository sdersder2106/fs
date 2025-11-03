import { prisma } from '@/lib/prisma';
import type { Notification } from '@prisma/client';

// Notification types
export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

// Create notification
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}): Promise<Notification> {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'INFO',
      link: data.link,
    },
  });
}

// Create notification for multiple users
export async function createBulkNotifications(
  userIds: string[],
  notification: {
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  }
): Promise<void> {
  const notifications = userIds.map(userId => ({
    userId,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'INFO',
    link: notification.link,
  }));

  await prisma.notification.createMany({
    data: notifications,
  });
}

// Notify company users
export async function notifyCompanyUsers(
  companyId: string,
  notification: {
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  },
  excludeUserId?: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      companyId,
      id: excludeUserId ? { not: excludeUserId } : undefined,
    },
    select: { id: true },
  });

  const userIds = users.map(u => u.id);
  
  if (userIds.length > 0) {
    await createBulkNotifications(userIds, notification);
  }
}

// Notify pentest team
export async function notifyPentestTeam(
  pentestId: string,
  notification: {
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  },
  excludeUserId?: string
): Promise<void> {
  const pentest = await prisma.pentest.findUnique({
    where: { id: pentestId },
    include: {
      createdBy: true,
      findings: {
        select: {
          reporterId: true,
          assignedToId: true,
        },
      },
    },
  });

  if (!pentest) return;

  // Get unique user IDs
  const userIds = new Set<string>();
  userIds.add(pentest.createdById);

  pentest.findings.forEach(finding => {
    userIds.add(finding.reporterId);
    if (finding.assignedToId) {
      userIds.add(finding.assignedToId);
    }
  });

  // Remove excluded user
  if (excludeUserId) {
    userIds.delete(excludeUserId);
  }

  if (userIds.size > 0) {
    await createBulkNotifications(Array.from(userIds), notification);
  }
}

// Notification templates
export const notificationTemplates = {
  // Pentest notifications
  pentestCreated: (pentestTitle: string, pentestId: string) => ({
    title: 'New Pentest Created',
    message: `A new penetration test "${pentestTitle}" has been created`,
    type: 'INFO' as NotificationType,
    link: `/dashboard/pentests/${pentestId}`,
  }),

  pentestStarted: (pentestTitle: string, pentestId: string) => ({
    title: 'Pentest Started',
    message: `Penetration test "${pentestTitle}" is now in progress`,
    type: 'INFO' as NotificationType,
    link: `/dashboard/pentests/${pentestId}`,
  }),

  pentestCompleted: (pentestTitle: string, pentestId: string) => ({
    title: 'Pentest Completed',
    message: `Penetration test "${pentestTitle}" has been completed`,
    type: 'SUCCESS' as NotificationType,
    link: `/dashboard/pentests/${pentestId}`,
  }),

  // Finding notifications
  findingCreated: (severity: string, title: string, findingId: string) => ({
    title: `New ${severity} Finding`,
    message: `A new ${severity.toLowerCase()} severity finding "${title}" has been reported`,
    type: severity === 'CRITICAL' || severity === 'HIGH' ? 'ERROR' as NotificationType : 'WARNING' as NotificationType,
    link: `/dashboard/findings/${findingId}`,
  }),

  findingAssigned: (findingTitle: string, findingId: string) => ({
    title: 'Finding Assigned',
    message: `You have been assigned to work on "${findingTitle}"`,
    type: 'WARNING' as NotificationType,
    link: `/dashboard/findings/${findingId}`,
  }),

  findingResolved: (findingTitle: string, findingId: string) => ({
    title: 'Finding Resolved',
    message: `Finding "${findingTitle}" has been marked as resolved`,
    type: 'SUCCESS' as NotificationType,
    link: `/dashboard/findings/${findingId}`,
  }),

  findingStatusChanged: (findingTitle: string, newStatus: string, findingId: string) => ({
    title: 'Finding Status Updated',
    message: `Finding "${findingTitle}" status changed to ${newStatus}`,
    type: 'INFO' as NotificationType,
    link: `/dashboard/findings/${findingId}`,
  }),

  // Report notifications
  reportGenerated: (reportTitle: string, reportId: string) => ({
    title: 'Report Generated',
    message: `Report "${reportTitle}" has been generated and is ready for review`,
    type: 'SUCCESS' as NotificationType,
    link: `/dashboard/reports/${reportId}`,
  }),

  reportApproved: (reportTitle: string) => ({
    title: 'Report Approved',
    message: `Report "${reportTitle}" has been approved`,
    type: 'SUCCESS' as NotificationType,
    link: '/dashboard/reports',
  }),

  // Comment notifications
  commentAdded: (entityType: string, entityTitle: string, entityId: string) => ({
    title: 'New Comment',
    message: `A new comment was added to ${entityType} "${entityTitle}"`,
    type: 'INFO' as NotificationType,
    link: `/dashboard/${entityType}s/${entityId}`,
  }),

  // Target notifications
  targetAdded: (targetName: string, targetId: string) => ({
    title: 'New Target Added',
    message: `A new target "${targetName}" has been added`,
    type: 'INFO' as NotificationType,
    link: `/dashboard/targets/${targetId}`,
  }),

  targetRiskChanged: (targetName: string, riskScore: number, targetId: string) => ({
    title: 'Target Risk Updated',
    message: `Target "${targetName}" risk score updated to ${riskScore}`,
    type: riskScore >= 80 ? 'ERROR' as NotificationType : 'WARNING' as NotificationType,
    link: `/dashboard/targets/${targetId}`,
  }),

  // System notifications
  systemMaintenance: (date: string) => ({
    title: 'Scheduled Maintenance',
    message: `System maintenance is scheduled for ${date}`,
    type: 'WARNING' as NotificationType,
  }),

  passwordExpiring: (days: number) => ({
    title: 'Password Expiring Soon',
    message: `Your password will expire in ${days} days. Please update it soon.`,
    type: 'WARNING' as NotificationType,
    link: '/dashboard/settings',
  }),

  accountLocked: () => ({
    title: 'Account Locked',
    message: 'Your account has been locked due to multiple failed login attempts',
    type: 'ERROR' as NotificationType,
  }),

  welcomeMessage: (userName: string) => ({
    title: 'Welcome to Base44!',
    message: `Welcome ${userName}! Your account has been created successfully. Start by exploring the dashboard.`,
    type: 'SUCCESS' as NotificationType,
    link: '/dashboard',
  }),
};

// Get user notifications
export async function getUserNotifications(
  userId: string,
  options?: {
    limit?: number;
    unreadOnly?: boolean;
    type?: NotificationType;
  }
) {
  const where: any = { userId };

  if (options?.unreadOnly) {
    where.isRead = false;
  }

  if (options?.type) {
    where.type = options.type;
  }

  return await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit,
  });
}

// Get notification count
export async function getNotificationCount(
  userId: string,
  unreadOnly: boolean = true
): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: unreadOnly ? false : undefined,
    },
  });
}

// Mark notification as read
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  return await prisma.notification.update({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
    data: {
      isRead: true,
    },
  });
}

// Mark all notifications as read
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

// Delete notification
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.delete({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
  });
}

// Delete old notifications
export async function deleteOldNotifications(
  userId: string,
  daysOld: number = 30
): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  await prisma.notification.deleteMany({
    where: {
      userId,
      createdAt: { lt: cutoffDate },
      isRead: true, // Only delete read notifications
    },
  });
}

// Clear all notifications
export async function clearAllNotifications(userId: string): Promise<void> {
  await prisma.notification.deleteMany({
    where: { userId },
  });
}

// Notification subscription (for future WebSocket/SSE implementation)
export interface NotificationSubscription {
  userId: string;
  callback: (notification: Notification) => void;
}

const subscriptions = new Map<string, NotificationSubscription[]>();

export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): () => void {
  const subscription: NotificationSubscription = { userId, callback };
  
  const userSubs = subscriptions.get(userId) || [];
  userSubs.push(subscription);
  subscriptions.set(userId, userSubs);

  // Return unsubscribe function
  return () => {
    const subs = subscriptions.get(userId) || [];
    const index = subs.indexOf(subscription);
    if (index > -1) {
      subs.splice(index, 1);
    }
    if (subs.length === 0) {
      subscriptions.delete(userId);
    } else {
      subscriptions.set(userId, subs);
    }
  };
}

// Emit notification to subscribers
export function emitNotification(notification: Notification): void {
  const userSubs = subscriptions.get(notification.userId) || [];
  userSubs.forEach(sub => {
    sub.callback(notification);
  });
}
