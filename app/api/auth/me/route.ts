import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api-response';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return unauthorizedResponse();
    }

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        company: true,
        notifications: {
          where: { isRead: false },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            notifications: { where: { isRead: false } },
            findingsReported: true,
            pentestsCreated: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    // Format response
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      company: {
        id: user.company.id,
        name: user.company.name,
        domain: user.company.domain,
        logo: user.company.logo,
      },
      notifications: user.notifications,
      stats: {
        unreadNotifications: user._count.notifications,
        findingsReported: user._count.findingsReported,
        pentestsCreated: user._count.pentestsCreated,
        totalComments: user._count.comments,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(userData);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return errorResponse('Failed to fetch user data', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { fullName, phone, bio, avatar } = body;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        fullName,
        phone,
        bio,
        avatar,
      },
      include: {
        company: true,
      },
    });

    return successResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      company: {
        id: updatedUser.company.id,
        name: updatedUser.company.name,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return errorResponse('Failed to update user', 500);
  }
}
