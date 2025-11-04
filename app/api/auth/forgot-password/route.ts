import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateId } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // In production, send actual email here
    if (user) {
      // Generate reset token (in production, save this to database)
      const resetToken = generateId();
      
      // TODO: Send email with reset link
      // await sendPasswordResetEmail(user.email, resetToken);
      
      console.log('Password reset requested for:', email);
      console.log('Reset token (save this):', resetToken);
    }

    return NextResponse.json(
      { success: true, message: 'If the email exists, a reset link has been sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
