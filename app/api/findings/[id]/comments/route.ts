import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  attachments: z.array(z.string()).default([]),
});

// GET - Get all comments for a finding
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify finding belongs to company
    const finding = await prisma.finding.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    });

    if (!finding) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        findingId: params.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create new comment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify finding belongs to company
    const finding = await prisma.finding.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        createdBy: true,
        assignee: true,
      },
    });

    if (!finding) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        attachments: validatedData.attachments,
        findingId: params.id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'COMMENT',
        entity: 'FINDING',
        entityId: finding.id,
        action: `Commented on finding: ${finding.title}`,
        userId: session.user.id,
        pentestId: finding.pentestId,
        findingId: finding.id,
      },
    });

    // Check for @mentions in comment
    const mentionRegex = /@(\w+)/g;
    const mentions = validatedData.content.match(mentionRegex);

    if (mentions) {
      // Get mentioned users (simplified - in production, match by username/email)
      const mentionedUserIds = new Set<string>();

      // Notify finding creator if mentioned
      if (finding.createdById !== session.user.id) {
        mentionedUserIds.add(finding.createdById);
      }

      // Notify assignee if mentioned and exists
      if (finding.assigneeId && finding.assigneeId !== session.user.id) {
        mentionedUserIds.add(finding.assigneeId);
      }

      // Create notifications
      if (mentionedUserIds.size > 0) {
        await prisma.notification.createMany({
          data: Array.from(mentionedUserIds).map((userId) => ({
            type: 'COMMENT_MENTION',
            title: 'You were mentioned',
            message: `${session.user.name} mentioned you in a comment on ${finding.title}`,
            link: `/findings/${finding.id}`,
            userId,
          })),
        });
      }
    } else {
      // Regular comment notification (not a mention)
      const notifyUsers = new Set<string>();

      // Notify finding creator
      if (finding.createdById !== session.user.id) {
        notifyUsers.add(finding.createdById);
      }

      // Notify assignee if exists
      if (finding.assigneeId && finding.assigneeId !== session.user.id) {
        notifyUsers.add(finding.assigneeId);
      }

      if (notifyUsers.size > 0) {
        await prisma.notification.createMany({
          data: Array.from(notifyUsers).map((userId) => ({
            type: 'COMMENT_MENTION',
            title: 'New comment',
            message: `${session.user.name} commented on ${finding.title}`,
            link: `/findings/${finding.id}`,
            userId,
          })),
        });
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
