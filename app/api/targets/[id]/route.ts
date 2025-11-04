import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const targetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  url: z.string().optional(),
  ipAddress: z.string().optional(),
  targetType: z.enum(['WEB_APPLICATION', 'API_ENDPOINT', 'NETWORK_INFRASTRUCTURE', 'MOBILE_APPLICATION', 'CLOUD_RESOURCES']),
  criticalityLevel: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  technologyStack: z.array(z.string()).default([]),
  businessImpact: z.string().optional(),
  owner: z.string().optional(),
  nextAssessment: z.string().optional(),
});

// GET - Get single target
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const target = await prisma.target.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        pentests: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
          },
          orderBy: {
            startDate: 'desc',
          },
        },
        findings: {
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            pentests: true,
            findings: true,
          },
        },
      },
    });

    if (!target) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 });
    }

    return NextResponse.json(target);
  } catch (error) {
    console.error('Get target error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch target' },
      { status: 500 }
    );
  }
}

// PUT - Update target
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

    // Check if target exists and belongs to company
    const existingTarget = await prisma.target.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    });

    if (!existingTarget) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = targetSchema.parse(body);

    const target = await prisma.target.update({
      where: {
        id: params.id,
      },
      data: {
        ...validatedData,
        nextAssessment: validatedData.nextAssessment
          ? new Date(validatedData.nextAssessment)
          : null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'UPDATE',
        entity: 'TARGET',
        entityId: target.id,
        action: `Updated target: ${target.name}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(target);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update target error:', error);
    return NextResponse.json(
      { error: 'Failed to update target' },
      { status: 500 }
    );
  }
}

// DELETE - Delete target (soft delete)
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

    // Check if target exists and belongs to company
    const existingTarget = await prisma.target.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    });

    if (!existingTarget) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 });
    }

    // Soft delete - just mark as inactive
    const target = await prisma.target.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: false,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'DELETE',
        entity: 'TARGET',
        entityId: target.id,
        action: `Deleted target: ${target.name}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Target deleted' });
  } catch (error) {
    console.error('Delete target error:', error);
    return NextResponse.json(
      { error: 'Failed to delete target' },
      { status: 500 }
    );
  }
}
