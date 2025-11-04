import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const findingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED', 'FALSE_POSITIVE']).default('OPEN'),
  cvssScore: z.number().min(0).max(10).optional(),
  cvssVector: z.string().optional(),
  reproductionSteps: z.string().optional(),
  proofOfConcept: z.string().optional(),
  businessImpact: z.string().optional(),
  technicalImpact: z.string().optional(),
  likelihood: z.string().optional(),
  riskScore: z.number().optional(),
  affectedAssets: z.array(z.string()).default([]),
  screenshots: z.array(z.string()).default([]),
  recommendedFix: z.string().optional(),
  remediationPriority: z.string().optional(),
  fixDeadline: z.string().optional(),
  verificationStatus: z.string().optional(),
  retestNotes: z.string().optional(),
  owaspCategory: z.string().optional(),
  pentestId: z.string(),
  targetId: z.string(),
  assigneeId: z.string().optional(),
});

// GET - List all findings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const pentestId = searchParams.get('pentestId');
    const targetId = searchParams.get('targetId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = {
      companyId: session.user.companyId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (severity && severity !== 'ALL') {
      where.severity = severity;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (pentestId) {
      where.pentestId = pentestId;
    }

    if (targetId) {
      where.targetId = targetId;
    }

    const [findings, total] = await Promise.all([
      prisma.finding.findMany({
        where,
        include: {
          pentest: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          target: {
            select: {
              id: true,
              name: true,
              targetType: true,
              criticalityLevel: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: [
          { severity: 'asc' }, // CRITICAL first
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.finding.count({ where }),
    ]);

    return NextResponse.json({
      data: findings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get findings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch findings' },
      { status: 500 }
    );
  }
}

// POST - Create new finding
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    if (!['ADMIN', 'AUDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = findingSchema.parse(body);

    // Verify pentest belongs to company
    const pentest = await prisma.pentest.findUnique({
      where: {
        id: validatedData.pentestId,
        companyId: session.user.companyId,
      },
    });

    if (!pentest) {
      return NextResponse.json(
        { error: 'Pentest not found' },
        { status: 404 }
      );
    }

    // Verify target belongs to company
    const target = await prisma.target.findUnique({
      where: {
        id: validatedData.targetId,
        companyId: session.user.companyId,
      },
    });

    if (!target) {
      return NextResponse.json(
        { error: 'Target not found' },
        { status: 404 }
      );
    }

    const finding = await prisma.finding.create({
      data: {
        ...validatedData,
        fixDeadline: validatedData.fixDeadline
          ? new Date(validatedData.fixDeadline)
          : undefined,
        companyId: session.user.companyId,
        createdById: session.user.id,
      },
      include: {
        pentest: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            targetType: true,
            criticalityLevel: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'CREATE',
        entity: 'FINDING',
        entityId: finding.id,
        action: `Created ${finding.severity} finding: ${finding.title}`,
        userId: session.user.id,
        pentestId: finding.pentestId,
        findingId: finding.id,
      },
    });

    // Create notification for critical findings
    if (finding.severity === 'CRITICAL') {
      // Get all admins and auditors
      const users = await prisma.user.findMany({
        where: {
          companyId: session.user.companyId,
          role: {
            in: ['ADMIN', 'AUDITOR'],
          },
          id: {
            not: session.user.id, // Don't notify creator
          },
        },
      });

      // Create notifications
      await prisma.notification.createMany({
        data: users.map((user) => ({
          type: 'CRITICAL_FINDING',
          title: 'Critical Finding Detected',
          message: `New critical vulnerability: ${finding.title}`,
          link: `/findings/${finding.id}`,
          userId: user.id,
        })),
      });
    }

    return NextResponse.json(finding, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create finding error:', error);
    return NextResponse.json(
      { error: 'Failed to create finding' },
      { status: 500 }
    );
  }
}
