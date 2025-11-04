import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const findingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED', 'FALSE_POSITIVE']),
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
  targetId: z.string(),
  assigneeId: z.string().optional(),
});

// GET - Get single finding
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const finding = await prisma.finding.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        pentest: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            description: true,
            targetType: true,
            criticalityLevel: true,
            url: true,
            ipAddress: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        activityLogs: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
      },
    });

    if (!finding) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }

    return NextResponse.json(finding);
  } catch (error) {
    console.error('Get finding error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finding' },
      { status: 500 }
    );
  }
}

// PUT - Update finding
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    if (!['ADMIN', 'AUDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if finding exists and belongs to company
    const existingFinding = await prisma.finding.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    });

    if (!existingFinding) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = findingSchema.parse(body);

    // Track status change for notifications
    const statusChanged = existingFinding.status !== validatedData.status;
    const oldStatus = existingFinding.status;

    const finding = await prisma.finding.update({
      where: {
        id: params.id,
      },
      data: {
        ...validatedData,
        fixDeadline: validatedData.fixDeadline
          ? new Date(validatedData.fixDeadline)
          : null,
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
    const changes: any = {};
    if (statusChanged) {
      changes.status = { from: oldStatus, to: validatedData.status };
    }

    await prisma.activityLog.create({
      data: {
        type: 'UPDATE',
        entity: 'FINDING',
        entityId: finding.id,
        action: statusChanged
          ? `Changed status from ${oldStatus} to ${validatedData.status}: ${finding.title}`
          : `Updated finding: ${finding.title}`,
        changes,
        userId: session.user.id,
        pentestId: finding.pentestId,
        findingId: finding.id,
      },
    });

    // Create notification for status change
    if (statusChanged) {
      // Notify creator if not the updater
      if (finding.createdById !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'STATUS_CHANGE',
            title: 'Finding Status Changed',
            message: `${finding.title} status changed to ${validatedData.status}`,
            link: `/findings/${finding.id}`,
            userId: finding.createdById,
          },
        });
      }

      // Notify assignee if exists and not the updater
      if (finding.assigneeId && finding.assigneeId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'STATUS_CHANGE',
            title: 'Finding Status Changed',
            message: `${finding.title} status changed to ${validatedData.status}`,
            link: `/findings/${finding.id}`,
            userId: finding.assigneeId,
          },
        });
      }
    }

    return NextResponse.json(finding);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update finding error:', error);
    return NextResponse.json(
      { error: 'Failed to update finding' },
      { status: 500 }
    );
  }
}

// DELETE - Delete finding
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only admins can delete
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if finding exists and belongs to company
    const existingFinding = await prisma.finding.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    });

    if (!existingFinding) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }

    // Delete finding (cascade will handle comments and activity logs)
    await prisma.finding.delete({
      where: {
        id: params.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'DELETE',
        entity: 'FINDING',
        entityId: params.id,
        action: `Deleted finding: ${existingFinding.title}`,
        userId: session.user.id,
        pentestId: existingFinding.pentestId,
      },
    });

    return NextResponse.json({ success: true, message: 'Finding deleted' });
  } catch (error) {
    console.error('Delete finding error:', error);
    return NextResponse.json(
      { error: 'Failed to delete finding' },
      { status: 500 }
    );
  }
}
