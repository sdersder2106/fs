import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

// Cache configuration
const CACHE_TAGS = {
  dashboard: 'dashboard',
  pentests: 'pentests',
  findings: 'findings',
  targets: 'targets',
  reports: 'reports',
  users: 'users',
  companies: 'companies'
} as const;

// Optimized dashboard stats query with caching
export const getDashboardStats = cache(async (companyId: string) => {
  return unstable_cache(
    async () => {
      const [
        pentestsCount,
        findingsCount,
        targetsCount,
        criticalFindings,
        highRiskTargets,
        recentActivity
      ] = await Promise.all([
        prisma.pentest.count({
          where: { companyId }
        }),
        prisma.finding.count({
          where: { companyId }
        }),
        prisma.target.count({
          where: { companyId }
        }),
        prisma.finding.count({
          where: {
            companyId,
            severity: 'CRITICAL'
          }
        }),
        prisma.target.count({
          where: {
            companyId,
            risk: 'HIGH'
          }
        }),
        prisma.finding.findMany({
          where: { companyId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            severity: true,
            createdAt: true,
            pentest: {
              select: {
                name: true
              }
            }
          }
        })
      ]);

      return {
        pentests: pentestsCount,
        findings: findingsCount,
        targets: targetsCount,
        critical: criticalFindings,
        highRisk: highRiskTargets,
        recentActivity
      };
    },
    [`dashboard-${companyId}`],
    {
      revalidate: 60, // Cache for 60 seconds
      tags: [CACHE_TAGS.dashboard]
    }
  )();
});

// Optimized pentests query with pagination
export const getPentests = cache(async (
  companyId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  return unstable_cache(
    async () => {
      const [items, total] = await Promise.all([
        prisma.pentest.findMany({
          where: { companyId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                findings: true,
                targets: true
              }
            },
            assignedTo: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }),
        prisma.pentest.count({ where: { companyId } })
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    },
    [`pentests-${companyId}-${page}-${limit}`],
    {
      revalidate: 30,
      tags: [CACHE_TAGS.pentests]
    }
  )();
});

// Optimized findings query with filters
export const getFindings = cache(async (
  companyId: string,
  filters?: {
    severity?: string;
    status?: string;
    pentestId?: string;
  },
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const where: any = { companyId };
  if (filters?.severity) where.severity = filters.severity;
  if (filters?.status) where.status = filters.status;
  if (filters?.pentestId) where.pentestId = filters.pentestId;

  return unstable_cache(
    async () => {
      const [items, total] = await Promise.all([
        prisma.finding.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { severity: 'desc' },
            { createdAt: 'desc' }
          ],
          include: {
            pentest: {
              select: {
                id: true,
                name: true
              }
            },
            target: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }),
        prisma.finding.count({ where })
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    },
    [`findings-${companyId}-${JSON.stringify(filters)}-${page}-${limit}`],
    {
      revalidate: 30,
      tags: [CACHE_TAGS.findings]
    }
  )();
});

// Optimized targets query
export const getTargets = cache(async (
  companyId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  return unstable_cache(
    async () => {
      const [items, total] = await Promise.all([
        prisma.target.findMany({
          where: { companyId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                findings: true
              }
            },
            pentest: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }),
        prisma.target.count({ where: { companyId } })
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    },
    [`targets-${companyId}-${page}-${limit}`],
    {
      revalidate: 30,
      tags: [CACHE_TAGS.targets]
    }
  )();
});

// Function to revalidate cache
export async function revalidateCache(tags: (keyof typeof CACHE_TAGS)[]) {
  const { revalidateTag } = await import('next/cache');
  
  for (const tag of tags) {
    await revalidateTag(CACHE_TAGS[tag]);
  }
}

// Batch operations for better performance
export const batchCreateFindings = async (
  findings: any[],
  companyId: string
) => {
  const data = findings.map(f => ({
    ...f,
    companyId
  }));
  
  const result = await prisma.finding.createMany({
    data,
    skipDuplicates: true
  });
  
  await revalidateCache(['findings', 'dashboard']);
  return result;
};

// Connection pool optimization
export async function optimizeConnection() {
  // Pre-warm the connection
  await prisma.$connect();
  
  // Set connection pool size based on environment
  if (process.env.NODE_ENV === 'production') {
    await prisma.$executeRaw`SET statement_timeout = '10s'`;
    await prisma.$executeRaw`SET lock_timeout = '5s'`;
  }
}