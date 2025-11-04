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

// GET - List all targets
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const targetType = searchParams.get('targetType');
    const criticalityLevel = searchParams.get('criticalityLevel');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = {
      companyId: session.user.companyId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (targetType) {
      where.targetType = targetType;
    }

    if (criticalityLevel) {
      where.criticalityLevel = criticalityLevel;
    }

    const [targets, total] = await Promise.all([
      prisma.target.findMany({
        where,
        include: {
          _count: {
            select: {
              pentests: true,
              findings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.target.count({ where }),
    ]);

    return NextResponse.json({
      data: targets,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get targets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch targets' },
      { status: 500 }
    );
  }
}

// POST - Create new target
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
    const validatedData = targetSchema.parse(body);

    const target = await prisma.target.create({
      data: {
        ...validatedData,
        nextAssessment: validatedData.nextAssessment
          ? new Date(validatedData.nextAssessment)
          : undefined,
        companyId: session.user.companyId,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'CREATE',
        entity: 'TARGET',
        entityId: target.id,
        action: `Created target: ${target.name}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(target, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create target error:', error);
    return NextResponse.json(
      { error: 'Failed to create target' },
      { status: 500 }
    );
  }
}
