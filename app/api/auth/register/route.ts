import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validateEmail, validatePassword } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, companyName } = body;

    // Validate input
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
        },
      });

      // Create user as ADMIN of the new company
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
          emailVerified: new Date(), // Auto-verify for demo
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
        },
      });

      return { user, company };
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'CREATE',
        entity: 'USER',
        entityId: result.user.id,
        action: 'User registered',
        userId: result.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: result.user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
